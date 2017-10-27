import argparse


def parse_arguments():
    parser_description = \
        """
        To set database parameters for the application.
        """

    parser = argparse.ArgumentParser(description=parser_description)
    parser.add_argument('--bolt_url',
                        dest='bolt_url',
                        type=str,
                        default="bolt://localhost:7687",
                        help='Bolt url to use for database connection')
    parser.add_argument('--user',
                        dest='user',
                        type=str,
                        default="neo4j",
                        help='User to use for database connection')
    parser.add_argument('--password',
                        dest='password',
                        type=str,
                        default="neo4j",
                        help='Password to use for database connection')
    arguments = parser.parse_args()
    return arguments
