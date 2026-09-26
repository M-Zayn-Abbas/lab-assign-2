"""Data Input Module: parses raw user/file input into Python data."""


def parse_numbers(text):
    """'5, 3 8,1' -> [5, 3, 8, 1]. Raises ValueError on bad tokens."""
    if text is None or not str(text).strip():
        raise ValueError("Input is empty")
    tokens = str(text).replace(",", " ").split()
    nums = []
    for t in tokens:
        try:
            nums.append(int(t))
        except ValueError:
            try:
                nums.append(float(t))
            except ValueError:
                raise ValueError(f"Invalid number: '{t}'")
    return nums


def parse_edges(text):
    """'A-B:4, B-C:2, C-D' -> [('A','B',4), ('B','C',2), ('C','D',1)]"""
    if text is None or not str(text).strip():
        raise ValueError("Input is empty")
    edges = []
    for part in str(text).split(","):
        part = part.strip()
        if not part:
            continue
        weight = 1
        if ":" in part:
            part, w = part.split(":", 1)
            try:
                weight = int(w)
            except ValueError:
                raise ValueError(f"Invalid weight: '{w}'")
        if "-" not in part:
            raise ValueError(f"Invalid edge: '{part}' (expected U-V)")
        u, v = [x.strip() for x in part.split("-", 1)]
        if not u or not v:
            raise ValueError(f"Invalid edge: '{part}'")
        edges.append((u, v, weight))
    return edges


def load_numbers_from_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return parse_numbers(f.read())
