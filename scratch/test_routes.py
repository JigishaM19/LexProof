import httpx

routes = [
    "/",
    "/login",
    "/register",
    "/dashboard",
    "/cases/33b710cc-628e-4d38-904f-03e29b5e565f",
    "/cases/33b710cc-628e-4d38-904f-03e29b5e565f/report",
    "/verification/coverage",
    "/resources/supported-documents"
]

client = httpx.Client(timeout=20.0)

all_ok = True
for r in routes:
    try:
        res = client.get(f"http://localhost:3000{r}")
        print(f"ROUTE {r} -> STATUS {res.status_code}")
        if res.status_code != 200:
            all_ok = False
    except Exception as e:
        print(f"ROUTE {r} -> ERROR {e}")
        all_ok = False

if all_ok:
    print("\nALL NEXT.JS FRONTEND ROUTES RESPONDING WITH STATUS 200 OK!")
else:
    print("\nSOME ROUTES RETURNED NON-200")
