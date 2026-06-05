"""
Phusion Passenger WSGI entry point.
Passenger requires a callable named `application` in this file.
"""
import sys
import os

# Ensure the app root is on the Python path
sys.path.insert(0, os.path.dirname(__file__))

from app import app as application
