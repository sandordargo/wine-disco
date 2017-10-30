from database.node import Node


class WineryNode(Node):

    def __init__(self, id, type, caption, village, url=None):
        self.caption = caption
        self.type = type
        self.id = id
        self.expanded = False
        self.village = village
        self.url = url

    def to_json(self):
        return {"caption": self.caption, "type": self.type, "id": self.id,
                "expanded": "true" if self.expanded else "false",
                "village": self.village, "url": self.url}
