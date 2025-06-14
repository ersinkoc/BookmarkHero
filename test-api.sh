#!/bin/bash

# API Test Script
API_URL="http://localhost:3001/api"
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="Test123!Pass"
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
BOOKMARK_ID=""
COLLECTION_ID=""
TAG_ID=""

echo "🧪 Testing BookmarkHero API"
echo "=============================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper function to print results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# 1. Test health endpoint
echo -e "\n1. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/../health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Health check passed"
else
    print_result 1 "Health check failed (HTTP $HTTP_CODE)"
fi

# 2. Test user registration
echo -e "\n2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test User",
        "email": "'$TEST_USER_EMAIL'",
        "password": "'$TEST_USER_PASSWORD'"
    }' \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "409" ]; then
    if [ "$HTTP_CODE" == "409" ]; then
        echo "User already exists, proceeding with login..."
    else
        print_result 0 "User registration successful"
        USER_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.user.id')
    fi
else
    print_result 1 "User registration failed (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# 3. Test user login
echo -e "\n3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{
        "email": "'$TEST_USER_EMAIL'",
        "password": "'$TEST_USER_PASSWORD'"
    }' \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "User login successful"
    ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.data.tokens.accessToken')
    REFRESH_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.data.tokens.refreshToken')
    USER_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.user.id')
else
    print_result 1 "User login failed (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
    exit 1
fi

# 4. Test get current user
echo -e "\n4. Testing get current user..."
ME_RESPONSE=$(curl -s -X GET $API_URL/auth/me \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Get current user successful"
else
    print_result 1 "Get current user failed (HTTP $HTTP_CODE)"
fi

# 5. Test create bookmark
echo -e "\n5. Testing create bookmark..."
CREATE_BOOKMARK_RESPONSE=$(curl -s -X POST $API_URL/bookmarks \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "url": "https://github.com/anthropics/claude-code",
        "title": "Claude Code Repository",
        "description": "Official Claude Code repository"
    }' \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$CREATE_BOOKMARK_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$CREATE_BOOKMARK_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "409" ]; then
    if [ "$HTTP_CODE" == "201" ]; then
        print_result 0 "Create bookmark successful"
        BOOKMARK_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.bookmark.id')
    else
        echo "Bookmark already exists"
    fi
else
    print_result 1 "Create bookmark failed (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# 6. Test get bookmarks
echo -e "\n6. Testing get bookmarks..."
GET_BOOKMARKS_RESPONSE=$(curl -s -X GET "$API_URL/bookmarks?page=1&limit=10" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$GET_BOOKMARKS_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$GET_BOOKMARKS_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Get bookmarks successful"
    TOTAL_BOOKMARKS=$(echo "$RESPONSE_BODY" | jq -r '.data.total')
    echo "  Total bookmarks: $TOTAL_BOOKMARKS"
    # Get first bookmark ID if we don't have one
    if [ -z "$BOOKMARK_ID" ]; then
        BOOKMARK_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.bookmarks[0].id // empty')
    fi
else
    print_result 1 "Get bookmarks failed (HTTP $HTTP_CODE)"
fi

# 7. Test create collection
echo -e "\n7. Testing create collection..."
CREATE_COLLECTION_RESPONSE=$(curl -s -X POST $API_URL/collections \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Development Resources",
        "description": "Useful development links",
        "color": "#3B82F6"
    }' \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$CREATE_COLLECTION_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$CREATE_COLLECTION_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "201" ]; then
    print_result 0 "Create collection successful"
    COLLECTION_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.collection.id')
else
    print_result 1 "Create collection failed (HTTP $HTTP_CODE)"
fi

# 8. Test get collections
echo -e "\n8. Testing get collections..."
GET_COLLECTIONS_RESPONSE=$(curl -s -X GET $API_URL/collections \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$GET_COLLECTIONS_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$GET_COLLECTIONS_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Get collections successful"
    TOTAL_COLLECTIONS=$(echo "$RESPONSE_BODY" | jq -r '.data.collections | length')
    echo "  Total collections: $TOTAL_COLLECTIONS"
    # Get first collection ID if we don't have one
    if [ -z "$COLLECTION_ID" ]; then
        COLLECTION_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.collections[0].id // empty')
    fi
else
    print_result 1 "Get collections failed (HTTP $HTTP_CODE)"
fi

# 9. Test create tag
echo -e "\n9. Testing create tag..."
CREATE_TAG_RESPONSE=$(curl -s -X POST $API_URL/tags \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "development",
        "color": "#10B981"
    }' \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$CREATE_TAG_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$CREATE_TAG_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "409" ]; then
    if [ "$HTTP_CODE" == "201" ]; then
        print_result 0 "Create tag successful"
        TAG_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.tag.id')
    else
        echo "Tag already exists"
    fi
else
    print_result 1 "Create tag failed (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# 10. Test get tags
echo -e "\n10. Testing get tags..."
GET_TAGS_RESPONSE=$(curl -s -X GET $API_URL/tags \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$GET_TAGS_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$GET_TAGS_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Get tags successful"
    TOTAL_TAGS=$(echo "$RESPONSE_BODY" | jq -r '.data.tags | length')
    echo "  Total tags: $TOTAL_TAGS"
    # Get first tag ID if we don't have one
    if [ -z "$TAG_ID" ]; then
        TAG_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.tags[0].id // empty')
    fi
else
    print_result 1 "Get tags failed (HTTP $HTTP_CODE)"
fi

# 11. Test update bookmark
if [ ! -z "$BOOKMARK_ID" ] && [ ! -z "$COLLECTION_ID" ] && [ ! -z "$TAG_ID" ]; then
    echo -e "\n11. Testing update bookmark..."
    UPDATE_BOOKMARK_RESPONSE=$(curl -s -X PUT $API_URL/bookmarks/$BOOKMARK_ID \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Claude Code - Updated",
            "isFavorite": true,
            "collectionIds": ["'$COLLECTION_ID'"],
            "tagIds": ["'$TAG_ID'"]
        }' \
        -w "\n%{http_code}")

    HTTP_CODE=$(echo "$UPDATE_BOOKMARK_RESPONSE" | tail -n 1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_result 0 "Update bookmark successful"
    else
        print_result 1 "Update bookmark failed (HTTP $HTTP_CODE)"
    fi
else
    echo -e "\n11. Skipping update bookmark test (missing IDs)"
fi

# 12. Test search bookmarks
echo -e "\n12. Testing search bookmarks..."
SEARCH_RESPONSE=$(curl -s -X GET "$API_URL/bookmarks/search?q=claude" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$SEARCH_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$SEARCH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Search bookmarks successful"
    SEARCH_RESULTS=$(echo "$RESPONSE_BODY" | jq -r '.data.total')
    echo "  Search results: $SEARCH_RESULTS"
else
    print_result 1 "Search bookmarks failed (HTTP $HTTP_CODE)"
fi

# 13. Test refresh token
echo -e "\n13. Testing refresh token..."
REFRESH_RESPONSE=$(curl -s -X POST $API_URL/auth/refresh \
    -H "Content-Type: application/json" \
    -d '{
        "refreshToken": "'$REFRESH_TOKEN'"
    }' \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Refresh token successful"
else
    print_result 1 "Refresh token failed (HTTP $HTTP_CODE)"
fi

# 14. Test logout
echo -e "\n14. Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST $API_URL/auth/logout \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Logout successful"
else
    print_result 1 "Logout failed (HTTP $HTTP_CODE)"
fi

echo -e "\n=============================="
echo "✅ API testing completed!"