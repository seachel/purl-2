"use strict"

// correctness options:
//  1.  - compute stitch sequence as stitch, so content of row is a "stitch"
//		- assume that number of stitches dropped is the correct amount for the start of the row
//		- in sequence of rows, stitches added in one row should equal the number of stitches dropped in the next row (unless allowing short rows; this will be handled later)

// need stitch codes
// sequences and repeats are stitches too?

// ----------
// Data Model
// ----------

function Stitch(stitchesAdded, stitchesDropped, stitchCode="no-code")
{
	return {
		stitchesAdded: stitchesAdded, // ensure this is a nat
		stitchesDropped: stitchesDropped, // ensure this is a nat
		stitchCode: stitchCode // ensure this is a string
	};
}

var knit = Stitch(1, 1, "K");
var purl = Stitch(1, 1, "P");
var slip = Stitch(1, 1, "S");
var yarnover = Stitch(1, 0, "YO");
var knittogether = (count) => Stitch(1, count,knit.stitchCode + count + "T");
var purltogether = (count) => Stitch(1, count,purl.stitchCode + count + "T");


function Row(stitchesStart)
{
	// public functions for constructing stitches and modifying row contents

	function Repeat(stitch, repCount, stitchCode = stitch.stitchCode + repCount)
	{
		var newCompoundStitch = Stitch(stitch.stitchesAdded * repCount,
					  		   stitch.stitchesDropped * repCount,
					  		   stitchCode)

		return newCompoundStitch;
	}

	// TODO: use proper division and remainder functions
	function UndeterminedRepeat(stitch)
	{
		var divisor = 0;
		var remainder = stitchesRemaining;

		if (remainder >= stitch.stitchesDropped)
		{
			while (remainder >= stitch.stitchesDropped)
			{
				remainder -= stitch.stitchesDropped;
				divisor++;
			}		
		}
		else
		{
			// TODO: need error to break everything... and different error if things are falsy due to being undefined
			console.log("ABORT! ABORT! cannot perform undetermined repeat!");
		}

		var newCompoundStitch = Repeat(stitch, divisor, "*" + stitch.stitchCode + "*");

		return newCompoundStitch;
	}

	// TODO: accept a list of arguments; use spread
	// TODO: let instead of var?
	function Sequence(stitch1, stitch2)
	{
		var addedBySequence = stitch1.stitchesAdded + stitch2.stitchesAdded;
		var droppedBySequence = stitch1.stitchesDropped + stitch2.stitchesDropped;

		var newCompoundStitch = Stitch(addedBySequence,
									   droppedBySequence,
									   "(" + stitch1.stitchCode + ", " + stitch2.stitchCode + ")");

		return newCompoundStitch;
	}

	function AddStitch(stitch)
	{
		stitches.push(stitch);
	}



	// private helper functions

	function getTotalStitchesAdded()
	{
	 	return stitches.reduce(
	 		((partialResult, currentStitch) =>
	 			 partialResult + currentStitch.stitchesAdded), 0);
	}

	function getTotalStitchesDropped()
	{
		return stitches.reduce(
	 		((partialResult, currentStitch) =>
	 			 partialResult + currentStitch.stitchesDropped), 0);
	}


	// returned object construction

	var stitches = [];

	var PublicAPI = {
		stitches: stitches,
		Repeat: Repeat, // remove?
		UndeterminedRepeat: UndeterminedRepeat,
		Sequence: Sequence, // remove?
		AddStitch: AddStitch
	}

	Object.defineProperty(PublicAPI, "stitchesStart",
		{
			value: stitchesStart,
			writable: false,
			configurable: false,
			enumerable: true
		});

	Object.defineProperty(PublicAPI, "stitchesEnd",
		{
			get: () => getTotalStitchesAdded(),
			enumerable: true
		});

	Object.defineProperty(PublicAPI, "stitchesRemaining",
		{
			get: () => stitchesStart - getTotalStitchesDropped(),
			enumerable: true
		});

	return PublicAPI;
}

function Pattern(castOnValue) {

	var rows = [];

	function AddNewRow()
	{
		//TODO: some check on row to make sure it is valid?
		rows.push(Row(this.lastRowWidth));
	}

	function getLastRow()
	{
		return rows[rows.length - 1]
	}

	var PublicAPI = {
		rows: rows,
		AddNewRow: AddNewRow
	};

	Object.defineProperty(PublicAPI, "castOnValue",
		{
			value: castOnValue,
			writable: false,
			configurable: false,
			enumerable: true
		});

	Object.defineProperty(PublicAPI, "lastRowWidth",
		{
			get: () => rows.length > 0 ? getLastRow().stitchesEnd : castOnValue,
			enumerable: true
		});

	return PublicAPI;
}

//-------------------
// ------------------
// Program Logic
// ------------------
// ------------------

function GetCastOnValue()
{
	// require that this input is numeric, and function returns a number
	return Number(document.querySelector('#cast-on-input').innerHTML);
}



// Temp State:

var currentPattern = Pattern(0);
var currentRowIndex = -1;

// -------------
// Update Model:
// -------------

function AddStitchToModel(stitch)
{
	// current stitch?
	getCurrentRow().AddStitch(stitch);
}

function AddRowToModel(row)
{
	currentPattern.AddNewRow(row);
	currentRowIndex++;
}

// ---------------
// Update Display:
// ---------------

function AddStitchToDisplay(stitch)
{
	// TODO: once have better display, specific controls for each stitch
	UpdateDisplay();

	// Update current row
	// Steps: find node for current row, append stitch html
	// classes for html node?
	var currentRowNode = document.querySelector('#row-' + currentRowIndex);

	var newStitchNode = htmlNodeForStitch(stitch);

	currentRowNode.appendChild(newStitchNode);
}

function AddRowToDisplay(row)
{
	// Initial display: print relevant row info
	var newNode = htmlNodeForRow(row);

	document.querySelector("#pattern-display").appendChild(newNode);

	UpdateDisplay();
}

function AddPatternToDisplay(pattern)
{
	var newNode = htmlNodeForPattern(pattern);

	document.querySelector("#pattern-display").appendChild(newNode);

	UpdateDisplay();
}

function UpdateDisplay()
{
	// TEMP display, will change as UI changes
	if (currentRowIndex >= 0)
	{
		var currentRow = getCurrentRow();

		document.querySelector('#row-stitches-start').innerHTML = currentRow.stitchesStart;
		document.querySelector('#row-stitches-remaining').innerHTML = currentRow.stitchesRemaining;
		document.querySelector('#row-stitches-end').innerHTML = currentRow.stitchesEnd;
	}
}

// ----------------
// Helper Functions
// ----------------

function getCurrentRow()
{
	// TODO: lots of checks to prevent bugs
	return currentPattern.rows[currentRowIndex];
}

function htmlNodeForStitch(stitch)
{
	var newNode = document.createElement('span');
	newNode.classList.add('stitch');

	// add comma separator if not first stitch
	var previousStitchCount = document.querySelectorAll('#row-' + currentRowIndex + ' .stitch').length;

	newNode.innerHTML = (previousStitchCount > 0 ? ", " : "") + stitch.stitchCode;

	return newNode;
}

function htmlNodeForRow(row)
{
	var newNode = document.createElement('div');
	newNode.id = "row-" + currentRowIndex;
	newNode.classList.add('row');
	newNode.innerHTML = "Row " + (currentRowIndex + 1) + ": " + row.stitches.join();
	
	return newNode;
}

function htmlNodeForPattern(pattern)
{
	var newNode = document.createElement('div');
	newNode.classList.add('pattern');
	newNode.innerHTML = "Cast-on " + currentPattern.castOnValue;

	return newNode;
}


// ---------------
// Event Handlers:
// ---------------

function UI_AddStitch(stitch)
{
	AddStitchToModel(stitch);
	AddStitchToDisplay(stitch);
}

function UI_AddNewRow()
{
	var newRow = Row(currentPattern.lastRowWidth);

	AddRowToModel(newRow);
	AddRowToDisplay(newRow);
}

function UI_NewPattern()
{
	var newPattern = Pattern(GetCastOnValue());
	
	currentPattern = newPattern; // currentPattern should never be null or undefined!! or at beginning?

	AddPatternToDisplay();
}


// TODO: how to test when elements from original page are null here?
document.onreadystatechange = function(e)
{
    if (document.readyState === 'complete')
    {
    	// TODO: different behaviour for different pages?

    	// Initialize temp state for testing
    	//currentPattern = Pattern(GetCastOnValue());

    	var btn_newPattern = document.querySelector('#btn_new-pattern');

    	// hook up button press handlers
    	if (btn_newPattern)
    	{
    		btn_newPattern.addEventListener('click', UI_NewPattern);
    	}

    	var btn_addRow = document.querySelector('#btn_add-row');

    	if (btn_addRow)
    	{
    		btn_addRow.addEventListener('click', UI_AddNewRow);
    	}

    	var btn_stitchKnit = document.querySelector('#btn_stitch-knit');

    	if (btn_stitchKnit)
    	{
    		btn_stitchKnit.addEventListener('click', () => UI_AddStitch(knit));
		}

		var btn_stitchPurl = document.querySelector('#btn_stitch-purl');

		if (btn_stitchPurl)
		{
			btn_stitchPurl.addEventListener('click', () => UI_AddStitch(purl));
		}

		var btn_stitchYarnover = document.querySelector('#btn_stitch-yarnover');

		if (btn_stitchYarnover)
		{
			btn_stitchYarnover.addEventListener('click', () => UI_AddStitch(yarnover));
		}

		var btn_stitchKnit2together = document.querySelector('#btn_stitch-knit2together');

		if (btn_stitchKnit2together)
		{
			btn_stitchKnit2together.addEventListener('click', () => UI_AddStitch(knittogether(2)));
		}
	}
}