
"""
Contents of .env file:
user=postgres.kkggmcfkvddkilljrxcv
password=CS471DefinitelyASecurePassword!
host=aws-0-us-east-2.pooler.supabase.com
port=6543
dbname=postgres
"""

# import supabase
# from multiprocessing import connection
# import psycopg2
from dotenv import load_dotenv
import os
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool
from datetime import datetime
# from sqlalchemy.orm import sessionmaker
# import pandas as pd


class DatabaseManager:
    """
    DatabaseManager class handles connecting to the supabase
    
    Tables & Associated Methods:
    - Users:
        - Get all users
        - Add new user to Users table
        - Toggle user verified status
        - Get user information from id
    
    - Equipment_Items:
        - Add new equipment item
        - Get all equipment items
        - Get equipment item by id
    
    - Equipment_Checkouts:
        - Get all equipment checkouts
        - Add new equipment checkout
        - Checkin equipment item
        
    - Schedule:
        - Add new schedule event
        - Update existing schedule event
        - Delete schedule event
        - Get schedule events for a date
        - Get all schedule events
    """
    # METHODS NEEDED FOR BASIC DATABASE OPERATIONS

        # USERS
        # Get all users                         DONE
        # Add new user to Users table           DONE
        # Toggle user verified status           DONE
        # Get user information from id          DONE

        # EQUIPMENT_ITEMS
        # Add new equipment item                DONE
        # Get all equipment items               DONE
        # Get equipment item by id              DONE
        # Item is available                     DONE

        # EQUIPMENT_CHECKOUTS
        # Get all equipment checkouts           DONE
        # Add new equipment checkout            DONE
        # Checkin equipment item                DONE

        # SCHEDULE
        # Add new schedule event                DONE
        # Update existing schedule event        NOT DONE    --> Handle deleting value rather than replacing it
        # Delete schedule event                 DONE
        # Get schedule events for a date        NOT DONE
        # Get all schedule events               NOT DONE


    # Table structure for DEVS
    tables_dictionary = {
        "Users": {
            "columns": [
                ('id', 'bigint'),
                ('user_first_name', 'text'),
                ('user_last_name', 'text'),
                ('verified', 'boolean'),
                ('created_at', 'timestamp with time zone')
            ]
        },
        
        "Equipment_Items": {
            "columns": [
                ('id', 'text'),
                ('equipment_type', 'text'),
                ('available', 'boolean')
            ]
        },
            
        "Equipment_Checkouts": {
            "columns": [
                ('equipment_id', 'text'),
                ('person_id', 'bigint'),
                ('checkout_at', 'timestamp without time zone'),
                ('checkin_at', 'timestamp without time zone'),
                ('transaction_id', 'bigint')
            ]
            
            # Equipment_Checkouts Example:
            # (
            #     equipment_id = 101,
            #     person_id = 12358,
            #     checkout_at = datetime.datetime(2025, 8, 1, 11, 45),
            #     checkin_at = None,
            #     transaction_id = 15
            # )
        },
        
        "Schedule": {
            "columns": [
                ('id', 'bigint'),
                ('Event_name', 'text'),
                ('Time', 'time without time zone'),
                ('Date', 'date'),
                ('Day_of_week', 'text'),
                ('Place', 'text'),
                ('Recurs_weekly', 'boolean'),
                ('Recurs_until', 'date'),
                ('People', 'ARRAY')
            ]
        },
        
            # Schedule Example:
            # "Schedule": {
            #     "columns": [
                #     ('id', 1),
                #     ('Event_name', 'Team Meeting'),
                #     ('Time', datetime.time(10, 0)),
                #     ('Date', datetime.date(2025, 8, 5)),
                #     ('Day_of_week', 'Tuesday'),
                #     ('Place', 'Conference Room A'),
                #     ('Recurs_weekly', True),
                #     ('Recurs_until', datetime.date(2025, 12, 31)),
                #     ('People', ['Alice', 'Bob', 'Charlie'])
                # ]
            # }

    }


    def __init__(self):
        # Load environment variables from .env
        load_dotenv()

        # Fetch variables
        self.USER = os.getenv("user")
        self.PASSWORD = os.getenv("password")
        self.HOST = os.getenv("host")
        self.PORT = os.getenv("port")
        self.DBNAME = os.getenv("dbname")
        
        # Set standardized table names
        self.USERS_TABLE = "Users"
        self.EQUIPMENT_ITEMS_TABLE = "Equipment_Items"
        self.EQUIPMENT_CHECKOUTS_TABLE = "Equipment_Checkouts"
        self.SCHEDULE_TABLE = "Schedule"

        # Construct the SQLAlchemy connection string
        self.DATABASE_URL = f"postgresql+psycopg2://{self.USER}:{self.PASSWORD}@{self.HOST}:{self.PORT}/{self.DBNAME}?sslmode=require"

        self.engine = create_engine(self.DATABASE_URL, poolclass=NullPool)

    """
    Generic Database Access Methods
    """

    def query_table(self, table_name, limit=None, where_clause="1=1"):
        """Query all data from a specific table"""
        try:
            with self.engine.connect() as connection:
                query = f"SELECT * FROM \"{table_name}\" WHERE {where_clause}"
                if limit:
                    query += f" LIMIT {limit}"
                result = connection.execute(text(query))
                return result.fetchall()
        except Exception as e:
            print(f"Error querying table {table_name}: {e}")
            return None

    def get_table_columns(self, table_name):
        """Get column information for a specific table"""
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text(
                    f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table_name}'"
                ))
                return result.fetchall()
        except Exception as e:
            print(f"Error getting columns for table {table_name}: {e}")
            return None

    def insert_data(self, table_name, data_dict):
        """Insert data into a specific table"""
        try:
            with self.engine.connect() as connection:
                columns = []
                values = []
                for k, v in data_dict.items():
                    columns.append(k)
                    if v is None:
                        values.append("NULL")
                    else:
                        values.append(f"'{v}'")
                columns_str = ', '.join(columns)
                values_str = ', '.join(values)
                query = f"INSERT INTO \"{table_name}\" ({columns_str}) VALUES ({values_str})"
                connection.execute(text(query))
                connection.commit()
                # print(f"Data inserted into {table_name} successfully")
        except Exception as e:
            print(f"Error inserting data into {table_name}: {e}")

    def update_data(self, table_name, set_clause, where_clause):
        """Update data in a specific table"""
        try:
            with self.engine.connect() as connection:
                query = f"UPDATE \"{table_name}\" SET {set_clause} WHERE {where_clause}"
                connection.execute(text(query))
                connection.commit()
                # print(f"Data updated in {table_name} successfully")
        except Exception as e:
            print(f"Error updating data in {table_name}: {e}")

    def delete_data(self, table_name, where_clause):
        """Delete data from a specific table"""
        try:
            with self.engine.connect() as connection:
                query = f"DELETE FROM \"{table_name}\" WHERE {where_clause}"
                connection.execute(text(query))
                connection.commit()
                # print(f"Data deleted from {table_name} successfully")
        except Exception as e:
            print(f"Error deleting data from {table_name}: {e}")
    
    """
    # USERS METHODS SECTION:
    # Get all users                         DONE
    # Add new user to Users table           DONE
    # Toggle user verified status           DONE
    # Get user information from id          DONE
    """
    
    def get_all_users(self):
        """Get all users from the Users table"""
        return self.query_table(self.USERS_TABLE)

    def add_user(self, id, user_first_name, user_last_name, verified=True):
        """Add a new user to the Users table
        Args:
            id (int): User ID
            user_first_name (str): User's first name
            user_last_name (str): User's last name
            verified (bool): User's verification status, default is True
        """
        if not isinstance(id, int):
            raise ValueError("User ID must be an integer")
        if not isinstance(user_first_name, str):
            raise ValueError("User first name must be a string")
        if not isinstance(user_last_name, str):
            raise ValueError("User last name must be a string")
        if not isinstance(verified, bool):
            raise ValueError("User verified status must be a boolean")

        user_data = {
            "id": id,
            "user_first_name": user_first_name,
            "user_last_name": user_last_name,
            "verified": verified
        }
        self.insert_data(self.USERS_TABLE, user_data)

    def toggle_user_verified(self, user_id):
        """Toggle the verified status of a user"""
        user = self.get_user_by_id(user_id)
        if user:
            new_status = not user.verified
            self.update_data(self.USERS_TABLE, f"verified = {new_status}", f"id = {user_id}")

    def get_user_by_id(self, user_id):
        """
        Get user information from id
        
        Args:
            user_id (int): User ID
        
        Returns:
            dict: User information if found, otherwise None
        """
        result = self.query_table(self.USERS_TABLE, limit=1, where_clause=f"id = {user_id}")
        return result[0] if result else None
    
    """
    # EQUIPMENT_ITEMS
    # Add new equipment item                DONE
    # Get all equipment items               DONE
    # Get equipment item by id              DONE
    # item is available                     DONE
    # Toggle item availability              DONE
    """
    def add_equipment_item(self, id, equipment_type, available=True):
        """Add a new equipment item to the Equipment_Items table
        Args:
            id (str): Equipment ID
            equipment_type (str): Type of equipment
            available (bool): Availability status, default is True
        """
        if not isinstance(id, str):
            raise ValueError("Equipment ID must be a string")
        if not isinstance(equipment_type, str):
            raise ValueError("Equipment type must be a string")
        if not isinstance(available, bool):
            raise ValueError("Equipment availability status must be a boolean")

        equipment_data = {
            "id": id,
            "equipment_type": equipment_type,
            "available": available
        }
        self.insert_data(self.EQUIPMENT_ITEMS_TABLE, equipment_data)
    
    def get_all_equipment_items(self):
        """Get all equipment items from the Equipment_Items table"""
        return self.query_table(self.EQUIPMENT_ITEMS_TABLE)
    
    def get_equipment_item_by_id(self, equipment_id):
        """
        Get equipment item by id
        
        Args:
            equipment_id (str): Equipment ID
        
        Returns:
            dict: Equipment item information if found, otherwise None
        """
        result = self.query_table(self.EQUIPMENT_ITEMS_TABLE, limit=1, where_clause=f"id = '{equipment_id}'")
        return result[0] if result else None
    
    def toggle_equipment_availability(self, equipment_id):
        """Toggle the availability status of an equipment item"""
        equipment_item = self.get_equipment_item_by_id(equipment_id)
        if equipment_item:
            new_status = not equipment_item.available
            self.update_data(self.EQUIPMENT_ITEMS_TABLE, f"available = {new_status}", f"id = '{equipment_id}'")
    
    def item_is_available(self, equipment_id):
        """Check if an equipment item is available

        Args:
            equipment_id (str): Equipment ID

        Returns:
            bool: True if available, False otherwise
        """
        equipment_item = self.get_equipment_item_by_id(equipment_id)
        return equipment_item.available if equipment_item else False

    """
    # EQUIPMENT_CHECKOUTS
    # Get all equipment checkouts           DONE
    # Add new equipment checkout            DONE
    # Checkin equipment item                DONE
    """
    def get_all_equipment_checkouts(self):
        """Get all equipment checkouts from the Equipment_Checkouts table
        
        Returns
            dict: A dictionary where keys are equipment IDs and values are lists of checkout records
        Each record contains:
            - equipment_id: ID of the equipment
            - person_id: ID of the person who checked out the equipment
            - checkout_at: Timestamp of when the equipment was checked out
            - transaction_id: ID of the transaction
        """
        db_return = self.query_table(self.EQUIPMENT_CHECKOUTS_TABLE, where_clause= "checkin_at IS NULL")
        return_dictionary = {}
        for row in db_return:
            equipment_id = row.equipment_id
            if equipment_id not in return_dictionary:
                return_dictionary[equipment_id] = []
            return_dictionary[equipment_id].append({
                "equipment_id": row.equipment_id,
                "person_id": row.person_id,
                "checkout_at": row.checkout_at,
                # "checkin_at": row.checkin_at,
                "transaction_id": row.transaction_id
            })
        return return_dictionary

    def get_max_equipment_checkout_transaction_id(self):
        """Get the maximum transaction ID from the Equipment_Checkouts table"""
        db_return = self.query_table(self.EQUIPMENT_CHECKOUTS_TABLE, limit=1, where_clause="1=1 ORDER BY transaction_id DESC")
        max_transaction_id = db_return[0].transaction_id if db_return else 0
        return max_transaction_id

    def add_equipment_checkout(self, equipment_id, person_id, checkout_at = None):
        """Add a new equipment checkout to the Equipment_Checkouts table
        Args:
            equipment_id (str): ID of the equipment being checked out
            person_id (int): ID of the person checking out the equipment
            checkout_at (datetime, optional): Timestamp of when the equipment is checked out, defaults to current time
        """
        if not isinstance(equipment_id, str):
            raise ValueError("Equipment ID must be a string")
        if not isinstance(person_id, int):
            raise ValueError("Person ID must be an integer")
        
        if checkout_at is None:
            checkout_at = datetime.now()
            
        # Check equipment id is valid and item is available
        equipment_item = self.get_equipment_item_by_id(equipment_id)
        if not equipment_item:
            raise ValueError(f"Equipment item with ID '{equipment_id}' does not exist.")
        if not equipment_item.available:
            raise ValueError(f"Equipment item with ID '{equipment_id}' is not available for checkout.")

        transaction_id = self.get_max_equipment_checkout_transaction_id() + 1

        checkout_data = {
            "equipment_id": equipment_id,
            "person_id": person_id,
            "checkout_at": checkout_at,
            # "checkin_at": None,
            "transaction_id": transaction_id
        }
        self.insert_data(self.EQUIPMENT_CHECKOUTS_TABLE, checkout_data)

        # toggle item availability
        self.toggle_equipment_availability(equipment_id)
        
    def checkin_equipment_item(self, equipment_id, checkin_at=None):
        """Check in an equipment item that was previously checked out"""

        if not isinstance(equipment_id, str):
            raise ValueError("Equipment ID must be a string")

        if checkin_at is None:
            checkin_at = datetime.now()

        # Check if the equipment item is currently checked out
        is_checked_out = self.get_equipment_item_by_id(equipment_id).available is False
        if not is_checked_out:
            raise ValueError(f"Equipment item with ID '{equipment_id}' is not currently checked out.")

        # Update the checkout record with the check-in information
        self.update_data(table_name= self.EQUIPMENT_CHECKOUTS_TABLE,
                        set_clause= f"checkin_at = '{checkin_at}'",
                        where_clause= f"equipment_id = '{equipment_id}' AND checkin_at IS NULL")

        # Toggle item availability
        self.toggle_equipment_availability(equipment_id)

    """
    # SCHEDULE
    # Add new schedule event                NOT DONE
    # Update existing schedule event        NOT DONE
    # Delete schedule event                 NOT DONE
    # Get schedule events for a date        NOT DONE
    # Get all schedule events               NOT DONE
    """
    def add_schedule_event(self, event_name, time, date, day_of_week, place= None, recurs_weekly=False, recurs_until=None, event_description=None):
        """Add a new schedule event to the Schedule table

        Args:
        
        Example:
            event_name= "Team Meeting",
            time=       "20:30:00",
            date=       "2025-08-12",
            day_of_week="Tuesday",
            place=      "LC 4th Floor",
            recurs_weekly=True,
            recurs_until=   "2025-09-24",
            event_description= "Discuss project updates"

        """
        if not isinstance(event_name, str):
            raise ValueError("Event name must be a string")
        if not isinstance(time, str):
            raise ValueError("Time must be a string in 'HH:MM:SS' format")
        if not isinstance(date, str):
            raise ValueError("Date must be a string in 'YYYY-MM-DD' format")
        if not isinstance(day_of_week, str):
            raise ValueError("Day of week must be a string")
        if day_of_week.capitalize() not in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'M', 'T', 'Tu', 'W', 'Th', 'F', 'S', 'Sa', 'Su']:
            raise ValueError("Day of week must be a valid day name or abbreviation")
        if place is not None and not isinstance(place, str):
            raise ValueError("Place must be a string or None")
        if not isinstance(recurs_weekly, bool):
            raise ValueError("Recurs weekly must be a boolean")
        if recurs_until is not None and not isinstance(recurs_until, str):
            raise ValueError("Recurs until must be a string in 'YYYY-MM-DD' format or None")
        if event_description is not None and not isinstance(event_description, str):
            raise ValueError("Event description must be a string or None")

        # Convert date and time strings to appropriate types for db entry
        try:
            date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            raise ValueError("Date must be a string in 'YYYY-MM-DD' format")
        try:
            time = datetime.strptime(time, '%H:%M:%S').time()
        except ValueError:
            raise ValueError("Time must be a string in 'HH:MM:SS' format")
        if recurs_until is not None:
            try:
                recurs_until = datetime.strptime(recurs_until, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError("Recurs until must be a string in 'YYYY-MM-DD' format or None")

        schedule_data = {
            "event_name": event_name,
            "time": time,
            "date": date,
            "day_of_week": day_of_week,
            "recurs_weekly": recurs_weekly,
        }
        
        # Add optional fields if provided
        if place is not None:
            schedule_data.update({"place": place})
        if recurs_until is not None:
            schedule_data.update({"recurs_until": recurs_until})
        if event_description is not None:
            schedule_data.update({"event_description": event_description})

        self.insert_data(self.SCHEDULE_TABLE, schedule_data)
        
    def get_event_by_id(self, id):
        """Get schedule event by ID
        
        Args:
            id (int): ID of the event
        
        Returns:
            dict: Schedule event information if found, otherwise None
        """
        result = self.query_table(self.SCHEDULE_TABLE, limit=1, where_clause=f"id = {id}")
        return result[0] if result else None
    
    def delete_schedule_event(self, id):
        """Delete a schedule event from the Schedule table

        Args:
            id (int): ID of the event to delete
        """
        if not isinstance(id, int):
            raise ValueError("Event ID must be an integer")
        
        # Validate id corresponds to an existing event
        event = self.get_event_by_id(id)
        if not event:
            raise ValueError(f"Event with ID {id} does not exist.")
        
        self.delete_data(self.SCHEDULE_TABLE, f"id = {id}")

    def update_schedule_event(self, id, new_event_name = None, new_time = None, new_date = None, new_day_of_week = None, new_place = None, new_recurs_weekly = False, new_recurs_until = None, new_event_description = None):
        """Update an existing schedule event in the Schedule table

        # Functionally adds new event and deletes old event
        
        Args:
            event_id (int): ID of the event to update
            new_event_name (str): Name of the event
            new_time (str): Time of the event
            new_date (str): Date of the event
            new_day_of_week (str): Day of the week for the event
            new_place (str, optional): Place of the event
            new_recurs_weekly (bool, optional): Whether the event recurs weekly
            new_recurs_until (str, optional): Date until the event recurs
            new_event_description (str, optional): Description of the event
        """
        if not isinstance(id, int):
            raise ValueError("Event ID must be an integer")
        
        # if event does not exist, raise exception
        event = self.get_event_by_id(id)
        if not event:
            raise ValueError(f"Event with ID {id} does not exist.")


        if new_event_name is not None and not isinstance(new_event_name, str):
            raise ValueError("Event name must be a string")
        if new_time is not None and not isinstance(new_time, str):
            raise ValueError("Time must be a string in 'HH:MM:SS' format")
        if new_date is not None and not isinstance(new_date, str):
            raise ValueError("Date must be a string in 'YYYY-MM-DD' format")
        if new_day_of_week is not None and not isinstance(new_day_of_week, str):
            raise ValueError("Day of week must be a string")
        if new_day_of_week is not None and new_day_of_week.capitalize() not in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'M', 'T', 'Tu', 'W', 'Th', 'F', 'S', 'Sa', 'Su']:
            raise ValueError("Day of week must be a valid day name or abbreviation")
        if new_place is not None and not isinstance(new_place, str):
            raise ValueError("Place must be a string or None")
        if new_recurs_weekly is not None and not isinstance(new_recurs_weekly, bool):
            raise ValueError("Recurs weekly must be a boolean")
        if new_recurs_until is not None and not isinstance(new_recurs_until, str):
            raise ValueError("Recurs until must be a string in 'YYYY-MM-DD' format or None")
        if new_event_description is not None and not isinstance(new_event_description, str):
            raise ValueError("Event description must be a string or None")

        # Convert date and time strings to appropriate types for db entry
        if new_date is not None:
            try:
                new_date = datetime.strptime(new_date, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError("Date must be a string in 'YYYY-MM-DD' format")
        if new_time is not None:
            try:
                new_time = datetime.strptime(new_time, '%H:%M:%S').time()
            except ValueError:
                raise ValueError("Time must be a string in 'HH:MM:SS' format")
        if new_recurs_until is not None:
            try:
                new_recurs_until = datetime.strptime(new_recurs_until, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError("Recurs until must be a string in 'YYYY-MM-DD' format or None")


        set_clause = f"recurs_weekly = {new_recurs_weekly}"
        if new_event_name is not None:
            set_clause += f", event_name = '{new_event_name}'"
        if new_time is not None:
            set_clause += f", time = '{new_time}'"
        if new_date is not None:
            set_clause += f", date = '{new_date}'"
        if new_day_of_week is not None:
            set_clause += f", day_of_week = '{new_day_of_week}'"
        if new_place is not None:
            set_clause += f", place = '{new_place}'"
        if new_recurs_until is not None:
            set_clause += f", recurs_until = '{new_recurs_until}'"
        if new_event_description is not None:
            set_clause += f", event_description = '{new_event_description}'"

        self.update_data(self.SCHEDULE_TABLE, set_clause, f"id = {id}")

    def get_event_on_date(self, date):
        if not isinstance(date, str):
            raise ValueError("Date must be a string in 'YYYY-MM-DD' format")

        try:
            date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            raise ValueError("Date must be a string in 'YYYY-MM-DD' format")

        db_result = self.query_table(self.SCHEDULE_TABLE, where_clause=f"date = '{date}'")
        # query = f"SELECT * FROM {self.SCHEDULE_TABLE} WHERE date = '{date}'"
        result_as_dict = {}
        for row in db_result:
            result_as_dict[row['id']] = row
            
        return result_as_dict if result_as_dict else None

####################################
# DEV TEST BENCH



dbManager = DatabaseManager()


### Testing Schedule Table Methods ###
# Example: Add a new schedule event
# dbManager.add_schedule_event(
#     event_name="Team Meeting",
#     time="20:30:00",
#     date="2025-08-12",
#     day_of_week="Tuesday",
#     place="LC 4th Floor",
#     recurs_weekly=True,
#     # recurs_until="2025-09-24",
#     event_description="Discuss project updates"
# )

# Example: Delete Schedule Event
# dbManager.delete_schedule_event(7)

# Example: Update Schedule Event
# dbManager.update_schedule_event(
#     id=8,
#     new_event_name="Updated Team Meeting",
#     new_time="21:00:00",
#     new_date="2025-08-12",
#     new_day_of_week="Tuesday",
#     new_place="LC 4th Floor",
#     new_recurs_weekly=True,
#     # new_recurs_until="2025-09-24",
#     new_event_description="Discuss project updates - Updated"
# )

# Example: Get events on date
events = dbManager.get_event_on_date("2025-08-12")
print("Events on 2025-08-12:", events)

"""
### Testing Equipment Checkouts Table Methods ###
# Example: Get all equipment checkouts
# all_checkouts = dbManager.get_all_equipment_checkouts()
# print("All equipment checkouts:", all_checkouts)

# Example: Get maximum transaction ID
# max_transaction_id = dbManager.get_max_equipment_checkout_transaction_id()
# print("Maximum transaction ID:", max_transaction_id)

# Example: Add new equipment checkout
# dbManager.add_equipment_checkout('102', 98765)
# print("New equipment checkout added successfully")

# Example: Checkin equipment item
# dbManager.checkin_equipment_item('103')
# print("Equipment item checked in successfully")
"""



"""
### Testing Equipment Items Table Methods ###
# Example: Add a new equipment item
# dbManager.add_equipment_item('sandbag12', "Weight", True)
# print("New equipment item added successfully")

# Example: Get equipment item by ID: Valid Case
# equipment_item = dbManager.get_equipment_item_by_id('sandbag12')
# print("Equipment item information:", equipment_item)

# Example: Get equipment item by ID: Invalid Case
# invalid_equipment_item = dbManager.get_equipment_item_by_id('nonexistent_id')
# print("Equipment item information:", invalid_equipment_item)

# Example: Get all equipment items
# all_equipment_items = dbManager.get_all_equipment_items()
# print("All equipment items:", all_equipment_items)

# Example: Check if equipment item is available
is_available = dbManager.item_is_available('sandbag12')
print(f"Is equipment item 'sandbag12' available? {is_available}")

# Example: Toggle equipment availability
dbManager.toggle_equipment_availability('sandbag12')
print("Equipment availability toggled successfully")

# Example: Check if equipment item is available
is_available = dbManager.item_is_available('sandbag12')
print(f"Is equipment item 'sandbag12' available? {is_available}")
"""

"""
### Testing Users Table Methods ###
# Example: Get all users
# users = dbManager.get_all_users()
# print("All users:", users)

# # Example: Get user by ID: Valid Case
# user = dbManager.get_user_by_id(98765)
# print("User information:", user)

# # Example: Get user by ID: Invalid Case
# invalid_user = dbManager.get_user_by_id(99999)
# print("User information:", invalid_user)

# # Example: Add a new user
# dbManager.add_user(98765, "Jane", "Smith", True)
# print("New user added successfully")

# user = dbManager.get_user_by_id(98765)
# print("User information:", user)

# Example: Toggle user verified status
# dbManager.toggle_user_verified(98765)
# print("User verified status toggled successfully")

# user = dbManager.get_user_by_id(98765)
# print("User information:", user)
"""

### GET SCHEMA INFORMATION ###
# Example: Get columns from Schedule table
# columns = dbManager.get_table_columns("Schedule")
# print("Columns in Schedule table:", columns)

# Example: Get columns from Users table
# columns = dbManager.get_table_columns(self.USERS_TABLE)
# print("Columns in Users table:", columns)

# Example: Get columns from Equipment_Checkouts table
# columns = dbManager.get_table_columns("Equipment_Checkouts")
# print("Columns in Equipment_Checkouts table:", columns)

# Example: Get columns from Equipment_Items table
# columns = dbManager.get_table_columns("Equipment_Items")
# print("Columns in Equipment_Items table:", columns)


### GET SAMPLE DATA ###
# Example: Fetch data from a Users table
# result = dbManager.query_table(self.USERS_TABLE)
# print("Data from Users table:", result)

# # Example: Fetch data from Equipment_Checkouts table
# result = dbManager.query_table("Equipment_Checkouts")
# print("Data from Equipment_Checkouts table:", result)

# Example: Get info from Schedule Table
# result = dbManager.query_table("Schedule")
# print("Data from Schedule table:", result)

# Example: Get info from Equipment_Items Table
# result = dbManager.query_table("Equipment_Items")
# print("Data from Equipment_Items table:", result)





# # insert new user into users table
# new_user = {
#     "id": 12358,
#     "user_first_name": "John",
#     "user_last_name": "Doe",
#     "verified": True
# }
# dbManager.insert_data(self.USERS_TABLE, new_user)

# insert new equipment checkout into equipment table
# new_equipment_checkout = {
#     "equipment_id": 101,
#     "person_id": 12358,
#     "checkout_at": "2025-08-01 11:45:00",
#     "checkin_at": None,
#     "transaction_id": 15
# }

# dbManager.insert_data("Equipment_Checkouts", new_equipment_checkout)

# users_contents = dbManager.query_table(self.USERS_TABLE)
# print("Users table contents:", users_contents)