# Job Portal Backend

This is a backend API for a Job Portal built using **Django** and **Django REST Framework**.
The project is currently under development.

## Features (Work in Progress)

* User authentication and authorization
* Company profile management
* Job posting system
* Job application system
* Skill management
* RESTful APIs for frontend integration

## Tech Stack

* Python
* Django
* Django REST Framework
* PostgreSQL
* JWT Authentication

## Project Structure

* **users** – user authentication and profiles
* **companies** – company information and management
* **jobs** – job listings and job details
* **applications** – job applications by candidates
* **skills** – skill management and matching

## Setup Instructions

1. Clone the repository
2. Create a virtual environment
3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Configure environment variables using `.env`
5. Run migrations

```bash
python manage.py migrate
```

6. Start the server

```bash
python manage.py runserver
```

## Status

🚧 Project is currently under development.
