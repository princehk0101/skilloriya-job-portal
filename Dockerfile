FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip install celery redis psycopg2-binary gunicorn

COPY backend/ /app/

EXPOSE 8000 10000

CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120"]
