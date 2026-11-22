# Court card figures

All 12 figures (J, Q, K in spades, hearts, diamonds, clubs) are Dmitry Fomin's "English pattern" playing cards
from Wikimedia Commons (Category: SVG English pattern playing cards), released under CC0 1.0 Universal
(public domain dedication). Example: https://commons.wikimedia.org/wiki/File:English_pattern_king_of_spades.svg

Changes made for this app (22 Nov 2026):
- kept only the figure: removed the card background, Fomin's frame and middle line, the corner indices and the large suit marks inside the frame
- mapped the frame interior (30..330 x 30..510 in the 360 x 540 originals) onto the game's 150 x 258 court panel (squeezed about 7% sideways, nothing cropped)
- recoloured to a traditional palette: red #ff5555 -> #B5122E, blue #5555aa -> #1D3F94, yellow #ffff55 -> #E9B824, black -> #111111, white kept white

File names: <rank><suit>.svg, rank J/Q/K, suit S/H/D/C. Loaded by src/tip_deck.jsx (COURT_URL).
