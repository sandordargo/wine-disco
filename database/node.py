class Node(object):
    def __init__(self, id, type, caption):
        self.caption = caption
        self.type = type
        self.id = id
        self.expanded = False

    def to_json(self):
        return {"caption": self.caption, "type": self.type, "id": self.id, "expanded": "false"}
