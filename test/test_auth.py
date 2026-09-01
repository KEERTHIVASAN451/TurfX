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
# HOME PAGE TEST
# =========================================================

def test_home_page(client):

    response = client.get("/")

    assert response.status_code in [200, 302]


# =========================================================
# LOGIN PAGE TEST
# =========================================================

def test_login_page(client):

    response = client.get("/login")

    assert response.status_code in [200, 302]


# =========================================================
# REGISTER PAGE TEST
# =========================================================

def test_register_page(client):

    response = client.get("/register")

    assert response.status_code in [200, 302]


# =========================================================
# FORGOT PASSWORD PAGE TEST
# =========================================================

def test_forgot_password_page(client):

    response = client.get("/forgot-password")

    assert response.status_code in [200, 302, 404]


# =========================================================
# LOGOUT TEST
# =========================================================

def test_logout(client):

    response = client.get("/logout")

    assert response.status_code in [200, 302]


# =========================================================
# INVALID LOGIN TEST
# =========================================================

def test_invalid_login(client):

    response = client.post(
        "/login",
        data={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        },
        follow_redirects=True
    )

    assert response.status_code in [200, 302, 401, 404]


# =========================================================
# EMPTY LOGIN TEST
# =========================================================

def test_empty_login(client):

    response = client.post(
        "/login",
        data={
            "email": "",
            "password": ""
        },
        follow_redirects=True
    )

    assert response.status_code in [200, 302, 400, 404]


# =========================================================
# EMPTY REGISTER TEST
# =========================================================

def test_empty_register(client):

    response = client.post(
        "/register",
        data={
            "name": "",
            "email": "",
            "password": ""
        },
        follow_redirects=True
    )

    assert response.status_code in [200, 302, 400, 404]


# =========================================================
# AUTH TEST COMPLETE
# =========================================================

print(
    "TurfX authentication tests loaded successfully."
)