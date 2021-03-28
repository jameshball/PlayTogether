# PlayTogether

PlayTogether allows members to use other members' recordings as their backing tracks, leading to more cohesive playing. As more members submit their recordings, the backing track becomes more complete, making it easier to play in time and with more energy than when recording to a metronome.

PlayTogether is our submission for IC Hello World 2021.

## How to Run 

First ensure Postgres is installed on your machine and create a database called `hello-world`.

Clone the repository then run the following commands:

```
cd HelloWorldHack
pip3 install -r requirements.txt
PYTHONUNBUFFERED=1 && DATABASE_URL="postgresql://postgres:password@localhost:5432/hello-world" && python3 index.py
```

## Credits

- Andy Wang
- James Ball
- Jess Lally
- Tabs Goldman
- William Grant
