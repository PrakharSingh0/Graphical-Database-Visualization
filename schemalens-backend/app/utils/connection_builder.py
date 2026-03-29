def build_mysql_url(config):
    return f"mysql+pymysql://{config['username']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}"


def build_mongo_uri(config):
    # ✅ Atlas / Cloud
    if "uri" in config and config["uri"]:
        return config["uri"]

    # ✅ Local Mongo
    if "host" in config and "port" in config:
        return f"mongodb://{config['host']}:{config['port']}"

    # ❌ Invalid config
    raise ValueError("Invalid MongoDB config: provide either URI or host+port")


def build_connection(db_type, config):
    if db_type == "mysql":
        return build_mysql_url(config)
    elif db_type == "mongodb":
        return build_mongo_uri(config)
    else:
        raise ValueError("Unsupported DB type")