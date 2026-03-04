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
        # Try database search first (Notion API v2 uses "data_source")
        search_response = notion.search(
            filter={"property": "object", "value": "data_source"},
            page_size=1,
        )

        database_results = search_response.get("results", [])

        if database_results:
            # Create a page inside the database
            database_id = database_results[0]["id"]

            page = notion.pages.create(
                parent={"database_id": database_id},
                properties={
                    "title": {
                        "title": [{"type": "text", "text": {"content": title}}],
                    }
                },
                children=first_batch,
            )
        else:
            # No database found — look for any accessible page and create a
            # child page under it instead
            page_search = notion.search(
                filter={"property": "object", "value": "page"},
                page_size=1,
            )
            page_results = page_search.get("results", [])

            if not page_results:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "no_workspace_access",
                        "message": (
                            "No Notion pages or databases found. "
                            "Share a page or database with your Synapse integration first."
                        ),
                    },
                )

            parent_page_id = page_results[0]["id"]

            page = notion.pages.create(
                parent={"page_id": parent_page_id},
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

