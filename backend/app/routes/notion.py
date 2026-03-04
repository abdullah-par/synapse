from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException
from notion_client import Client

from app.config import settings
from app.schemas.notion import NotionSaveRequest, NotionSaveResponse

router = APIRouter()


def build_notion_blocks(blocks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Convert Synapse block format → official Notion API block format.

    Synapse type  →  Notion block type
    heading       →  heading_2
    paragraph     →  paragraph
    bullet        →  bulleted_list_item (one block per item)
    code          →  code
    timestamp     →  bulleted_list_item with mono formatting
    """
    notion_blocks: List[Dict[str, Any]] = []

    for block in blocks:
        block_type = block.get("type")

        if block_type == "heading":
            notion_blocks.append(
                {
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {"content": block.get("content", "")},
                            }
                        ]
                    },
                }
            )

        elif block_type == "paragraph":
            notion_blocks.append(
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {"content": block.get("content", "")},
                            }
                        ]
                    },
                }
            )

        elif block_type == "bullet":
            for item in block.get("items", []):
                notion_blocks.append(
                    {
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [
                                {"type": "text", "text": {"content": str(item)}}
                            ]
                        },
                    }
                )

        elif block_type == "code":
            notion_blocks.append(
                {
                    "object": "block",
                    "type": "code",
                    "code": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {"content": block.get("content", "")},
                            }
                        ],
                        "language": block.get("language", "plain text"),
                    },
                }
            )

        elif block_type == "timestamp":
            notion_blocks.append(
                {
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": f"[{block.get('time', '')}] "
                                },
                                "annotations": {"bold": True, "code": True},
                            },
                            {
                                "type": "text",
                                "text": {"content": block.get("topic", "")},
                            },
                        ]
                    },
                }
            )

    return notion_blocks


@router.post("/notion/save", response_model=NotionSaveResponse)
async def save_to_notion(request: NotionSaveRequest) -> NotionSaveResponse:
    """
    Save generated notes as a new page in the user's Notion workspace.
    Requires NOTION_API_KEY to be set in .env
    """
    try:
        notion = Client(auth=settings.notion_api_key)

        # Build the page title from metadata
        title = str(request.metadata.get("title", "Synapse Notes"))
        channel = str(request.metadata.get("channel", ""))
        duration = str(request.metadata.get("duration", ""))

        # Convert blocks to Notion format
        notion_blocks = build_notion_blocks(request.blocks)

        # Add a header callout at the top of the page
        header_blocks: List[Dict[str, Any]] = [
            {
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": (
                                    f"Source: {request.url}  ·  "
                                    f"Channel: {channel}  ·  Duration: {duration}"
                                )
                            },
                        }
                    ],
                    "icon": {"emoji": "🎬"},
                    "color": "default",
                },
            },
            {
                "object": "block",
                "type": "divider",
                "divider": {},
            },
        ]

        all_blocks = header_blocks + notion_blocks

        # Notion API limits: max 100 blocks per request
        first_batch = all_blocks[:100]
        remaining = all_blocks[100:]

        # For now, locate a database the integration can access
        search_response = notion.search(
            filter={"property": "object", "value": "database"},
            page_size=1,
        )

        if not search_response.get("results"):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "no_database",
                    "message": (
                        "No Notion database found. "
                        "Share a database with your Synapse integration first."
                    ),
                },
            )

        database_id = search_response["results"][0]["id"]

        page = notion.pages.create(
            parent={"database_id": database_id},
            properties={
                "title": {
                    "title": [{"type": "text", "text": {"content": title}}],
                }
            },
            children=first_batch,
        )

        # Append remaining blocks if any
        if remaining:
            notion.blocks.children.append(
                block_id=page["id"],
                children=remaining,
            )

        return NotionSaveResponse(
            success=True,
            notion_page_url=page.get("url", ""),
        )

    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - external dependency
        raise HTTPException(
            status_code=502,
            detail={
                "error": "notion_save_failed",
                "message": "Failed to save to Notion. Check your integration token.",
                "detail": str(exc),
            },
        ) from exc

