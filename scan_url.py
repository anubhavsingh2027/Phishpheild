import sys

def normalize_url(url):
    # Replace common homoglyphs with their letters
    replacements = {
        '0': 'o',
        '1': 'l',
        '3': 'e',
        '5': 's',
        '@': 'a',
        '$': 's'
    }
    for k, v in replacements.items():
        url = url.replace(k, v)
    return url

def is_malicious(url):
    suspicious_keywords = [
        "login", "secure", "update", "verify", "account", "webscr", "signin",
        "bank", "paypal", "password", "validate", "support", "security-check", "google"
    ]

    url = url.lower()
    url = normalize_url(url)  # Normalize first

    for keyword in suspicious_keywords:
        if keyword in url:
            return True
    return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("SAFE")  # Default to safe if no input
    else:
        url = sys.argv[1]
        if is_malicious(url):
            print("MALICIOUS")
        else:
            print("SAFE")
