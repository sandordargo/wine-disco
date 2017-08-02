class Edge(object):
    def __init__(self, caption, source, target):
        self.caption = caption
        self.source = source
        self.target = target

    def to_json(self):
        return {"source": self.source, "target": self.target, "caption": self.caption}
