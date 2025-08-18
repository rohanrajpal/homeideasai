from fastapi import APIRouter, HTTPException, Request
import requests
from app.config import settings
import re
from pydantic import BaseModel

router = APIRouter(tags=["lead-generation"])


@router.post("/baserow/webhook")
async def baserow_webhook(request: Request):
    data = await request.json()

    # Extract necessary information from the webhook data
    table_id = data.get("table_id")
    row_id = data["items"][0]["id"]
    username = (
        data["items"][0].get("Instagram Page", "").rstrip("/").split("/")[-1]
    )  # Extract username from URL

    if not username:
        return {"message": "Instagram username not found in the webhook data"}

    # Fetch Instagram analytics data
    analytics_data = fetch_instagram_analytics(username)

    if not analytics_data:
        return {"message": "Failed to fetch Instagram analytics"}

    # Extract email from Bio if present
    bio = analytics_data.get("biography", "")
    email_match = re.search(r"[\w\.-]+@[\w\.-]+", bio)
    contact_email = email_match.group(0) if email_match else ""

    # Prepare payload with all necessary fields
    payload = {
        "Name": analytics_data.get("name", "Updated Name"),
        "Followers": analytics_data.get("followers_count", 0),
        "Following": analytics_data.get("follows_count", 0),
        "Bio": analytics_data.get("biography", ""),
        "Media Count": analytics_data.get("media_count", 0),
        "Engagement Rate": round(analytics_data.get("engagement_rate", 0.0), 4),
        "Instagram Profile Website": analytics_data.get("website", ""),
        "Contact Email": contact_email,
    }

    # Update the row in Baserow
    baserow_url = f"https://api.baserow.io/api/database/rows/table/{table_id}/{row_id}/?user_field_names=true"
    headers = {
        "Authorization": f"Token {settings.BASEROW_API_TOKEN}",
        "Content-Type": "application/json",
    }

    response = requests.patch(baserow_url, headers=headers, json=payload)

    if response.status_code != 200:
        print(response.json())
        raise HTTPException(
            status_code=response.status_code, detail="Failed to update row"
        )

    return {"message": "Row updated successfully"}


def fetch_instagram_analytics(username: str) -> dict:
    url = f"https://api.usetevy.com/instagram-analytics/{username}"
    headers = {
        # "Authorization": f"Bearer undefined",
        "Content-Type": "application/json",
    }
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(response.json())
        return None
        # raise HTTPException(
        #     status_code=response.status_code,
        #     detail="Failed to fetch Instagram analytics",
        # )

    return response.json()


@router.get("/baserow/update-empty-names")
async def update_empty_names_in_baserow():
    table_id = "419321"  # Replace with your actual table ID
    base_url = f"https://api.baserow.io/api/database/rows/table/{table_id}/?user_field_names=true"
    headers = {
        "Authorization": f"Token {settings.BASEROW_API_TOKEN}",
        "Content-Type": "application/json",
    }

    page = 1
    email_to_row_id = {}  # Dictionary to track emails and their corresponding row IDs

    while True:
        response = requests.get(f"{base_url}&page={page}", headers=headers)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch rows from Baserow",
            )

        data = response.json()
        rows = data.get("results", [])

        if not rows:
            break  # Exit loop if no more rows are returned

        for row in rows:
            if not row.get("Name"):  # Check if the "Name" field is empty
                username = row.get("Instagram Page", "").rstrip("/").split("/")[-1]
                if username:
                    analytics_data = fetch_instagram_analytics(username)
                    if analytics_data:
                        # Extract email
                        contact_email = (
                            re.search(
                                r"[\w\.-]+@[\w\.-]+",
                                analytics_data.get("biography", "") or "",
                            ).group(0)
                            if re.search(
                                r"[\w\.-]+@[\w\.-]+",
                                analytics_data.get("biography", "") or "",
                            )
                            else ""
                        )

                        # Update the row with the fetched analytics data
                        payload = {
                            "Name": analytics_data.get("name", "Updated Name"),
                            "Followers": analytics_data.get("followers_count", 0),
                            "Following": analytics_data.get("follows_count", 0),
                            "Bio": analytics_data.get("biography", ""),
                            "Media Count": analytics_data.get("media_count", 0),
                            "Engagement Rate": round(
                                analytics_data.get("engagement_rate", 0.0), 4
                            ),
                            "Instagram Profile Website": analytics_data.get(
                                "website", ""
                            ),
                            "Contact Email": contact_email,
                        }
                        row_id = row["id"]
                        update_url = f"https://api.baserow.io/api/database/rows/table/{table_id}/{row_id}/?user_field_names=true"
                        update_response = requests.patch(
                            update_url, headers=headers, json=payload
                        )
                        if update_response.status_code != 200:
                            print(update_response.json())
                            raise HTTPException(
                                status_code=update_response.status_code,
                                detail="Failed to update row",
                            )

        page += 1  # Move to the next page


@router.delete("/baserow/remove-duplicates")
async def remove_duplicate_rows():
    table_id = "419321"  # Replace with your actual table ID
    base_url = f"https://api.baserow.io/api/database/rows/table/{table_id}/?user_field_names=true"
    headers = {
        "Authorization": f"Token {settings.BASEROW_API_TOKEN}",
        "Content-Type": "application/json",
    }

    page = 1
    url_to_row_id = (
        {}
    )  # Dictionary to track normalized URLs and their corresponding row IDs

    while True:
        response = requests.get(f"{base_url}&page={page}", headers=headers)
        if response.status_code != 200:
            print(response.json(), "page", page)
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch rows from Baserow",
            )

        data = response.json()
        rows = data.get("results", [])

        if not rows:
            break  # Exit loop if no more rows are returned

        for row in rows:
            instagram_page = row.get("Instagram Page", "").rstrip("/")
            if instagram_page:
                # Normalize the Instagram page URL
                normalized_url = instagram_page.replace(
                    "https://instagram.com/", "https://www.instagram.com/"
                )

                if normalized_url != instagram_page:
                    # Update the row with the normalized URL
                    update_payload = {"Instagram Page": normalized_url}
                    update_url = f"https://api.baserow.io/api/database/rows/table/{table_id}/{row['id']}/?user_field_names=true"
                    update_response = requests.patch(
                        update_url, headers=headers, json=update_payload
                    )
                    if update_response.status_code != 200:
                        print(update_response.json())
                        raise HTTPException(
                            status_code=update_response.status_code,
                            detail="Failed to update row with normalized URL",
                        )

                # Check for duplicate URL
                if normalized_url in url_to_row_id:
                    # Delete the current row if duplicate URL is found
                    delete_url = f"https://api.baserow.io/api/database/rows/table/{table_id}/{row['id']}/"
                    delete_response = requests.delete(delete_url, headers=headers)
                    if delete_response.status_code != 204:
                        print(delete_response.json())
                        raise HTTPException(
                            status_code=delete_response.status_code,
                            detail="Failed to delete duplicate row",
                        )
                else:
                    # Store normalized URL and row ID
                    url_to_row_id[normalized_url] = row["id"]

        page += 1  # Move to the next page

    return {"message": "Duplicate rows removed and URLs normalized successfully"}


class InstagramURLRequest(BaseModel):
    instagram_url: str


@router.post("/process-instagram-url")
async def process_instagram_url(request: InstagramURLRequest):
    # Extract username from the URL, handling @ prefix
    instagram_url = request.instagram_url.strip()
    if instagram_url.startswith("@"):
        instagram_url = instagram_url[1:]  # Remove the @ symbol

    username = instagram_url.rstrip("/").split("/")[-1].split("?")[0]
    if not username:
        raise HTTPException(status_code=400, detail="Invalid Instagram URL")

    # Check if the profile exists in Baserow
    database_id = "53215"
    table_id = "419321"
    workspace_id = "753826"
    baserow_url = f"https://api.baserow.io/api/database/rows/table/{table_id}/?user_field_names=true"
    headers = {
        "Authorization": f"Token {settings.BASEROW_API_TOKEN}",
        "Content-Type": "application/json",
    }

    # Search for the profile in Baserow
    search_url = f"{baserow_url}&search={username}"
    response = requests.get(search_url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code, detail="Failed to search Baserow"
        )

    existing_rows = response.json().get("results", [])

    # Fetch Instagram analytics
    analytics_data = fetch_instagram_analytics(username)
    if not analytics_data:
        raise HTTPException(
            status_code=404, detail="Failed to fetch Instagram analytics"
        )

    # Extract email from Bio if present
    bio = analytics_data.get("biography", "")
    email_match = re.search(r"[\w\.-]+@[\w\.-]+", bio)
    contact_email = email_match.group(0) if email_match else ""

    # Prepare payload
    payload = {
        "Instagram Page": f"https://www.instagram.com/{username}",
        "Name": analytics_data.get("name", ""),
        "Followers": analytics_data.get("followers_count", 0),
        "Following": analytics_data.get("follows_count", 0),
        "Bio": analytics_data.get("biography", ""),
        "Media Count": analytics_data.get("media_count", 0),
        "Engagement Rate": round(analytics_data.get("engagement_rate", 0.0), 4),
        "Instagram Profile Website": analytics_data.get("website", ""),
        "Contact Email": contact_email,
    }

    if existing_rows:
        # Update existing row
        row_id = existing_rows[0]["id"]
        update_url = f"https://api.baserow.io/api/database/rows/table/{table_id}/{row_id}/?user_field_names=true"
        response = requests.patch(update_url, headers=headers, json=payload)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, detail="Failed to update existing row"
            )
        row_url = f"https://baserow.io/database/{database_id}/table/{table_id}/{workspace_id}/row/{row_id}"
        return {
            "message": "Profile updated successfully",
            "data": response.json(),
            "row_url": row_url,
        }
    else:
        # Create new row
        response = requests.post(baserow_url, headers=headers, json=payload)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, detail="Failed to create new row"
            )
        row_id = response.json().get("id")
        row_url = f"https://baserow.io/database/{database_id}/table/{table_id}/{workspace_id}/row/{row_id}"
        return {
            "message": "Profile added successfully",
            "data": response.json(),
            "row_url": row_url,
        }
