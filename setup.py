from setuptools import setup, find_packages

setup(
    name="python-extractor",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'flask',
        'flask-cors',
        'pillow',
        'pytesseract',
        'selenium',
        'requests',
        'python-dotenv',
    ],
    python_requires='>=3.6',
)
