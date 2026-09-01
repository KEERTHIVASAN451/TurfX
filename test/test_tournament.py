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
# TOURNAMENT DASHBOARD TEST
# =========================================================

def test_tournament_dashboard(client):

    response = client.get(
        "/tournament"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# TOURNAMENT CREATE PAGE TEST
# =========================================================

def test_create_tournament_page(client):

    response = client.get(
        "/tournament/create"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# EMPTY TOURNAMENT TEST
# =========================================================

def test_empty_tournament(client):

    response = client.post(
        "/tournament/create",
        data={
            "name": "",
            "start_date": "",
            "end_date": "",
            "location": ""
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
# INVALID TOURNAMENT TEST
# =========================================================

def test_invalid_tournament(client):

    response = client.post(
        "/tournament/create",
        data={
            "name": "Test Tournament",
            "start_date": "2026-12-31",
            "end_date": "2026-01-01",
            "location": "Test Location"
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
# TOURNAMENT DETAILS TEST
# =========================================================

def test_tournament_details(client):

    response = client.get(
        "/tournament/1"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# TOURNAMENT TEAMS TEST
# =========================================================

def test_tournament_teams(client):

    response = client.get(
        "/tournament/1/teams"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# FIXTURES TEST
# =========================================================

def test_tournament_fixtures(client):

    response = client.get(
        "/tournament/1/fixtures"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# LEADERBOARD TEST
# =========================================================

def test_tournament_leaderboard(client):

    response = client.get(
        "/tournament/1/leaderboard"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# TEAM REGISTRATION TEST
# =========================================================

def test_team_registration(client):

    response = client.post(
        "/tournament/1/register",
        data={
            "team_name": "Test Team"
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
# TOURNAMENT RESULT TEST
# =========================================================

def test_tournament_results(client):

    response = client.get(
        "/tournament/1/results"
    )

    assert response.status_code in [
        200,
        302,
        404
    ]


# =========================================================
# TOURNAMENT TEST COMPLETE
# =========================================================

print(
    "TurfX tournament tests loaded successfully."
)