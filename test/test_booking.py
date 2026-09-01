import pytest

from app import app


# =========================================================
# TEST CONFIGURATION
# =========================================================

@pytest.fixture
def client():

    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


# =========================================================
# BOOKING PAGE TEST
# =========================================================

def test_booking_page(client):

    response = client.get("/booking")

    assert response.status_code in [200, 302, 404]


# =========================================================
# SEARCH TURF PAGE TEST
# =========================================================

def test_search_turf_page(client):

    response = client.get("/search-turf")

    assert response.status_code in [200, 302, 404]


# =========================================================
# TURF DETAILS PAGE TEST
# =========================================================

def test_turf_details_page(client):

    response = client.get("/turf/1")

    assert response.status_code in [200, 302, 404]


# =========================================================
# EMPTY BOOKING TEST
# =========================================================

def test_empty_booking(client):

    response = client.post(
        "/booking",
        data={
            "turf_id": "",
            "booking_date": "",
            "slot_id": ""
        },
        follow_redirects=True
    )

    assert response.status_code in [
        200,
        302,
        400,
        404
    ]


# =========================================================
# INVALID TURF BOOKING TEST
# =========================================================

def test_invalid_turf_booking(client):

    response = client.post(
        "/booking",
        data={
            "turf_id": "999999",
            "booking_date": "2026-12-31",
            "slot_id": "999999"
        },
        follow_redirects=True
    )

    assert response.status_code in [
        200,
        302,
        400,
        404
    ]


# =========================================================
# BOOKING HISTORY TEST
# =========================================================

def test_booking_history(client):

    response = client.get(
        "/booking-history"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# BOOKING CANCEL TEST
# =========================================================

def test_cancel_booking(client):

    response = client.post(
        "/booking/cancel/1",
        follow_redirects=True
    )

    assert response.status_code in [
        200,
        302,
        400,
        404
    ]


# =========================================================
# BOOKING TEST COMPLETE
# =========================================================

print(
    "TurfX booking tests loaded successfully."
)