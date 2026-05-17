@echo off
REM This script creates the directory structure for the gym management system frontend

setlocal enabledelayedexpansion

REM Change to the src directory
cd /d "c:\Users\Admin\Documents\Database Project\gym-management-system\frontend\UI\src"

REM Create all necessary directories
echo Creating directory structure...

mkdir components 2>nul
mkdir pages 2>nul
mkdir pages\public 2>nul
mkdir pages\admin 2>nul
mkdir pages\branch 2>nul
mkdir pages\staff 2>nul
mkdir pages\member 2>nul
mkdir hooks 2>nul
mkdir services 2>nul
mkdir context 2>nul
mkdir utils 2>nul

echo Directory structure created successfully!
