# User Management Scripts

This folder contains scripts to help manage user data in the GNDEC Complaint System database. The scripts are designed to help with bulk operations for updating role assignments and passwords.

## Available Scripts

### 1. SQL Scripts

- **update_users.sql**: Use this script if you want to run direct SQL queries to update existing users' roles and passwords.
- **insert_users.sql**: Use this script if you want to insert all the users at once using SQL.

### 2. JavaScript Scripts

- **run_db_updates.js**: This script attempts to update users using an RPC function to execute SQL directly. Note that this method requires your Supabase instance to have the appropriate function set up.
- **update_users_direct.js**: This script uses the Supabase JavaScript API to update user roles and passwords directly. This is the most reliable method if you already have users with these IDs.
- **insert_new_users.js**: This script checks if users exist and either inserts new ones or updates existing ones. This is the most complete and safe approach.

## How to Use

### Using the JavaScript Scripts

1. Make sure you have Node.js installed.
2. Install the required dependencies:
   ```
   npm install @supabase/supabase-js
   ```
3. Run one of the JavaScript files:
   ```
   node insert_new_users.js
   ```
   or
   ```
   node update_users_direct.js
   ```

### Using the SQL Scripts

1. Connect to your Supabase SQL editor (or any PostgreSQL client).
2. Open the desired SQL file.
3. Run the SQL commands in the file.

## Understanding the User Data

The scripts manage users with different roles:

1. **Student Accounts**: IDs 124, 125, 127, 128, 130, etc.
   - Password: `$2b$10$studentPassword123`

2. **Clerk Accounts**: IDs 126, 133, 138, 143, etc.
   - Password: `$2b$10$clerkPassword456`

3. **DSW Accounts**: IDs 129, 136, 145, 152, etc.
   - Password: `$2b$10$dswPassword789`

4. **Admin Accounts**: IDs 131, 141, 150, 157, etc.
   - Password: `$2b$10$adminPassword000`

## Important Notes

- These scripts assume that the users table has the structure described in the schema.
- The passwords are stored as bcrypt hashed values but are simplified for demonstration.
- Make sure to test these scripts in a development environment before running them in production.
- The scripts will display the results after execution for verification.
- Always make a backup of your database before running bulk update operations.

## Troubleshooting

If you encounter any issues:

1. Check that your Supabase URL and service key are correct.
2. Verify that the users table structure matches what the scripts expect.
3. Look at the error messages for specific issues.
4. You may need to adjust the scripts if your database schema is different. 