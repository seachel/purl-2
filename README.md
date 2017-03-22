# Purl Knitting Pattern Designer

The goal of this project is to provide an easy-to-use interface for defining correct knitting patterns. The patterns are written in the standard text format outlined by the Craft Yarn Council: [knitting abbreviations](http://www.craftyarncouncil.com/knit.html).

Not all of the standards are precisely defined, so we take some liberties with the Purl pattern language. For example, an undetermined repeat (repeat as many times as possible to the end of the row) of a knit stitch is commonly written the following ways:
- \*K; to the end of the row
- \*K;
- \*K\*
Here we will go with the third option, but all seem equally valid according to the CYC standard which says \* represents "repeat instructions following the single asterisk as directed".

This work builds on a project I completed in a compiler's course in the winter of 2014 during my undergraduate degree. The goal of that project was to compile a language for knitting patterns that included pattern modules to the expanded standard notation, with some basic correctness checking. The final report for that project can be found [here](https://128.84.21.199/abs/1606.08708?context=cs.PL).

## Description:

I am in the process of writing some documents about knitting, knitting patterns, and checking that knitting patterns are correct. I plan to post these on Medium. I will post links here when they are ready.

## Examples:

In its current state all pattern elements are used using buttons on the screen. Open index.html in your browser to begin. We will walk through building an example pattern.

1. Enter a value for the number of stitches to be cast on (or leave the default value). This will be the number of stitches initially available for the first row.

2. Press the _New Pattern_ button. This creates a pattern object with the specified cast on value.

3. Add a new row to the pattern by pressing _New Row_.

4. To add a stitch to this row, press any of the stitch buttons.

(TODO: will be expanded with a complete example, explaining the correctness checks in the background?)

## Development:

This project is developed using vanilla JS, HTML and CSS. As someone with little experience in web development, this has been a learning experience for me. I am very open to assistance and feedback, both on this specific project and also on more general coding practices.

If you want to help out, I'm looking for assistance making this think look more like it does in my mind. A basic outline of what I'm looking for is coming in the near future.

Please check out the issues and let me know if there's anything you think you could help with.

If you have other ideas about the project, I'd be happy to hear those as well. I plan on adding my longer-term goals into issue tracking too.


## Authors:

Chelsea Battell


## Copyright:

Chelsea Battell


## License:

TBD