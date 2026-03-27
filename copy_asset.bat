@echo off
set "src=%USERPROFILE%\.gemini\antigravity\brain\a6ffee86-ebe5-4c2d-949f-1cd286e64d7f\audience_silhouette_1774612832634.png"
set "dest=c:\dev\DEPT-Pj2-main\public\assets\images\theater\audience.png"
if exist "%src%" (
    copy /y "%src%" "%dest%"
    if %errorlevel% equ 0 (
        echo Copy successful
    ) else (
        echo Copy failed with error %errorlevel%
    )
) else (
    echo Source not found: %src%
)
