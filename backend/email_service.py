def check_emails():
    """
    Mock függvény az e-mailek lekérdezésére.
    Valós implementációban itt imaplib-et használnánk.
    """
    return [
        {"subject": "Új árajánlat kérés", "body": "Kérlek küldj egy árajánlatot a weboldalra...", "from": "ugyfel@example.com"}
    ]
