# Farm Assistant Addon

An addon to manage your farm's livestock data.

## Features

- Add, edit, and delete livestock records.
- Supports multiple animal types: Cattle, Dogs, Cats, Chickens, and Guinea Fowl.
- Provides a web interface for easy management.

## Installation

1. Add the repository to your Home Assistant instance.
2. Install the "Farm Assistant" addon.
3. Configure the addon with your database credentials.
4. Start the addon.

## Configuration

The addon requires a TimescaleDB database to store the livestock data. You will need to provide the following information in the addon's configuration tab:

- `db_host`: The hostname or IP address of your database server.
- `db_port`: The port number of your database server (usually 5432).
- `db_user`: The username for your database.
- `db_password`: The password for your database.
- `db_name`: The name of your database.
