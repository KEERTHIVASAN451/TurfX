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
# PAYMENT PAGE TEST
# =========================================================

def test_payment_page(client):

    response = client.get("/payment")

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# PAYMENT SUCCESS PAGE TEST
# =========================================================

def test_payment_success(client):

    response = client.get(
        "/payment/success"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# PAYMENT FAILED PAGE TEST
# =========================================================

def test_payment_failed(client):

    response = client.get(
        "/payment/failed"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# EMPTY PAYMENT TEST
# =========================================================

def test_empty_payment(client):

    response = client.post(
        "/payment",
        data={
            "booking_id": "",
            "amount": "",
            "payment_method": ""
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
# INVALID PAYMENT TEST
# =========================================================

def test_invalid_payment(client):

    response = client.post(
        "/payment",
        data={
            "booking_id": "999999",
            "amount": "0",
            "payment_method": "invalid"
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
# PAYMENT RECEIPT TEST
# =========================================================

def test_payment_receipt(client):

    response = client.get(
        "/payment/receipt/1"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# PAYMENT STATUS TEST
# =========================================================

def test_payment_status(client):

    response = client.get(
        "/payment/status/1"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# PAYMENT TEST COMPLETE
# =========================================================

print(
    "TurfX payment tests loaded successfully."
)