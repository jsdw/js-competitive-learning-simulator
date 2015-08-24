# Competitive Learning Simulator

This canvas based JS application was one of the first such things I made while learning JavaScript, back in 2012. It follows the theme of my PhD and illustrates how a few different competitive learning algorithms work on simple, drawable 2 dimensional data. Great for visualising what's going on if you are interested in these things!

Go [here](http://jsdw.github.io/js-competitive-learning-simulator/) to see it in action

## How it works

1. Select the square or circle shape from the command palette.
2. Click and drag somewhere on screen to draw said shapes.
3. Click play, pause and stop to watch the current algorithm (the default is Kohonen's Self Organising Map) attempt to learn about the shapes you have drawn. The algorithm is only told about one random point from within the shapes at a time, and from that attempts to learn about the general structure of the shapes (the input space).
4. Click the little down arrow on the top right of the command palette to see a bunch of configuration options. You can change algorithm specific parameters (including the algorithm used; I'd recommend checking out Growing Neural Gas); if you have left the algorithm running, sliding the sliders about should influence it in real time.

There are a few little bugs here and there but things should generally work!
