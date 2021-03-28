# PlayTogether

[PlayTogether](https://play--together.herokuapp.com/) allows members to use other members' recordings as their backing tracks, leading to more cohesive playing. As more members submit their recordings, the backing track becomes more complete, making it easier to play in time and with more energy than when recording to a metronome.

PlayTogether won 'Most innovative use of the Web' after its initial development during IC Hello World Hack 21.

## How to Run 

First ensure Postgres is installed on your machine and create a database called `hello-world`.

Clone the repository then run the following commands:

```
cd HelloWorldHack
pip3 install -r requirements.txt
PYTHONUNBUFFERED=1 && DATABASE_URL="postgresql://postgres:password@localhost:5432/hello-world" && python3 index.py
```

## Credits

- [Andy Wang](https://github.com/cbeuw)
- [James Ball](https://github.com/jameshball)
- [Jess Lally](https://github.com/jessicalally)
- [Tabs Goldman](https://github.com/tabsg)
- [William Grant](https://github.com/wdhg)
