from neo4j.v1 import GraphDatabase, basic_auth


class Driver(object):

    def __init__(self, bolt_url, username, password):
        self.bolt_url = bolt_url
        self.username = username
        self.password = password
        self.driver = GraphDatabase.driver(self.bolt_url, auth=basic_auth(self.username, self.password))
