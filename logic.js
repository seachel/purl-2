"use strict"

// correctness options:
//  1.  - compute stitch sequence as stitch, so content of row is a "stitch"
//		- assume that number of stitches dropped is the correct amount for the start of the row
//		- in sequence of rows, stitches added in one row should equal the number of stitches dropped in the next row (unless allowing short rows; this will be handled later)

// need stitch codes
// sequences and repeats are stitches too?

// ------------------------------------------------------
// ------------------------------------------------------
// Data Model
// ------------------------------------------------------
// ------------------------------------------------------

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
var emptyStitch = Stitch(0, 0, "-");



function Repeat(stitch = emptyStitch, repCount = 1, stitchCode = stitch.stitchCode + repCount)
{
	var newCompoundStitch = Stitch(stitch.stitchesAdded * repCount,
				  		   stitch.stitchesDropped * repCount,
				  		   stitchCode)

	return newCompoundStitch;
}

// TODO: let instead of var?
function Sequence(contents = [])
{
	var contents = contents;

	function NewStitch(stitch)
	{
		contents.push(stitch);
	}

	var PublicAPI =	{
		contents: contents,
		NewStitch: NewStitch
	}

	Object.defineProperty(PublicAPI, "isStitchOp",
		{
			value: true,
			writable: false,
			configurable: false,
			enumerable: true
		});

	Object.defineProperty(PublicAPI, "canBeNested",
		{
			value: true,
			writable: false,
			configurable: false,
			enumerable: true
		});

	Object.defineProperty(PublicAPI, "stitchCode",
		{
			get: () => "(" + contents.map(st => st.stitchCode).join() + ")",
			enumerable: true
		});

	Object.defineProperty(PublicAPI, "stitchesAdded",
		{
			get: () => contents.reduce(
							(result, current) => result + current.stitchesAdded,
							0),
			enumerable: true
		});

	Object.defineProperty(PublicAPI, "stitchesDropped",
		{
			get: () => contents.reduce(
							(result, current) => result + current.stitchesDropped,
							0),
			enumerable: true
		});


	return PublicAPI;
}


function Row(stitchesStart)
{
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
		UndeterminedRepeat: UndeterminedRepeat,
		stitches: stitches,
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
	var errors = [];

	function AddNewRow()
	{
		checkPatternCorrectness();

		rows.push(Row(this.lastRowWidth));
	}

	function getLastRow()
	{
		return rows[rows.length - 1]
	}

	function RemainingStitchesError(stitchesRemaining, rowIndex)
	{
		var errorMessage = "Error: " + stitchesRemaining + " stitches remaining in row " + (rowIndex + 1);

		return RowError(errorMessage, rowIndex);
	}

	function AdjacentRowError(row1StitchesEnd, row1Index, row2StitchesStart)
	{
		var errorMessage = "Error: Adjacent row error. " + row1StitchesEnd
							+ " stitches at the end of row " + (row1Index + 1)
							+ "and " + row2StitchesStart + " stitches at the start of row "
							+ (row1Index + 2);

		return RowError(errorMessage, row1Index);
	}

	function checkPatternCorrectness()
	{
		// TODO: will be run whenever a new row is added
		//	- checks that final number of stitches in row matches the starting number of stitches in the next
		//		-> true by construction?
		// - when an error is added, want it to be displayed in the front end
		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++)
		{
			if (rows[rowIndex].stitchesRemaining > 0)
			{
				errors.push(RemainingStitchesError(rows[rowIndex].stitchesRemaining, rowIndex));
			}
			if (rowIndex + 1 < rows.length)
			{
				var currentRowStitchesEnd = rows[rowIndex].stitchesEnd;
				var nextRowStitchesStart = rows[rowIndex + 1].stitchesStart;

				if (currentRowStitchesEnd !== nextRowStitchesStart)
				{
					errors.push(AdjacentRowError(currentRowStitchesEnd, rowIndex, nextRowStitchesStart))
				}
			}
		}
	}

	var PublicAPI = {
		rows: rows,
		AddNewRow: AddNewRow,
		errors: errors
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


function Error(message)
{
	return {
		message: message,
	}
}

function RowError(message, rowIndex = currentRowIndex)
{
	var errorMessage = "Error in row " + rowIndex + ": " + message;

	return Error(errorMessage);
}


// ------------------------------------------------------
// ------------------------------------------------------
// Program Logic
// ------------------------------------------------------
// ------------------------------------------------------

function GetCastOnValue()
{
	// require that this input is numeric, and function returns a number
	return Number(document.querySelector('#cast-on-input').innerHTML);
}



// Temp State:

var currentPattern;
var currentRowIndex = -1;
var currentStitch;

// -------------
// Update Model:
// -------------

function AddStitchToModel(stitch)
{
	if (currentStitch && currentStitch.isStitchOp)
	{
		currentStitch.NewStitch(stitch);
	}
	else
	{	
		getCurrentRow().AddStitch(stitch);
	}
}

function AddRowToModel(row)
{
	currentPattern.AddNewRow(row);
}

// ---------------
// Update Display:
// ---------------

function AddStitchToDisplay(stitch)
{
	// Update current row
	// Steps: find node for current row, append stitch html
	// classes for html node?

	var newStitchNode = htmlNodeForStitch(stitch);

	var selectedStitches = document.querySelectorAll('.stitch-is-selected');

	if (currentStitch && currentStitch.isStitchOp && selectedStitches.length === 1)
	{
		var stitchContainer = document.querySelectorAll('.stitch-is-selected .stitch-container');

		if (stitchContainer && stitchContainer.length === 1)
		{
			var previousStitchCount = document.querySelectorAll('.stitch-is-selected .stitch').length;

			if (previousStitchCount > 0)
			{
				stitchContainer[0].append(',');	
			}

			stitchContainer[0].appendChild(newStitchNode);
		}
	}
	else
	{
		var stitchContainer = document.querySelector('#row-' + currentRowIndex + ' .stitch-container');

		if (stitchContainer)
		{
			var previousStitchCount = document.querySelectorAll('#row-' + currentRowIndex + ' .stitch').length;

			if (previousStitchCount > 0)
			{
				stitchContainer.append(",");
			}

			// TODO: if a stitch is selected, add the new one to the selected stitch OR replace it
			//			otherwise, add to the end of the current row

			stitchContainer.appendChild(newStitchNode);
		}
	}

	if (stitch.isStitchOp)
	{
		if (selectedStitches.length > 0)
		{
			selectedStitches.forEach(st => st.classList.toggle("stitch-is-selected"));
		}

		newStitchNode.classList.add("stitch-is-selected");
		currentStitch = stitch;
	}

	UpdateDisplay();
}

function AddRowToDisplay(row)
{
	// Initial display: print relevant row info
	var newNode = htmlNodeForRow(row);

	document.querySelector("#pattern-display").appendChild(newNode);

	UpdateDisplay();
}

function AddCurrentPatternToDisplay()
{
	var newNode = htmlNodeForCurrentPattern();

	document.querySelector("#pattern-display").appendChild(newNode);

	UpdateDisplay();
}

function ClearPatternDisplay()
{
	var patternDisplayNode = document.querySelector("#pattern-display");

	while (patternDisplayNode.firstChild)
	{
		patternDisplayNode.removeChild(patternDisplayNode.firstChild);
	}

	currentPattern = undefined;
	currentRowIndex = -1;
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
	if (currentRowIndex > currentPattern.rows.length - 1)
	{
		// TODO: program error, not pattern error!
	}

	return currentPattern.rows[currentRowIndex];
}

function htmlNodeForStitch(stitch)
{
	var newNode = document.createElement('span');
	newNode.classList.add('stitch');

	if (stitch.isStitchOp)
	{
		var stitchContainer = document.createElement('span');
		stitchContainer.classList.add('stitch-container');

		newNode.append("(");
		newNode.appendChild(stitchContainer);
		newNode.append(")");
	}
	else
	{
		newNode.innerHTML = stitch.stitchCode;
	}

	return newNode;
}

function htmlNodeForRow(row)
{
	var newNode = document.createElement('div');
	newNode.id = "row-" + currentRowIndex;
	newNode.classList.add('row');

	var stitchContainer = document.createElement('span');
	stitchContainer.classList.add('stitch-container');
	stitchContainer.innerHTML = row.stitches.join();

	newNode.innerHTML = "Row " + (currentRowIndex + 1) + ": ";
	newNode.appendChild(stitchContainer);
	
	return newNode;
}

function htmlNodeForCurrentPattern()
{
	var newNode = document.createElement('div');
	newNode.classList.add('pattern');
	newNode.innerHTML = "Cast-on " + currentPattern.castOnValue;

	return newNode;
}

// --------------
// Error Handling
// --------------

// TODO:
// - adding an error to the model
// - adding an error to the display
// - function to write HTML element

function AddError(errorMessage)
{
	var newError = Error(errorMessage);

	AddErrorToModel(newError);
	AddErrorToDisplay(newError);
}

function AddRowError(errorMessage)
{
	var newError = RowError(errorMessage, currentRowIndex + 1);

	AddErrorToModel(newError);
	AddErrorToDisplay(newError);
}

function AddErrorToModel(error)
{
	currentPattern.AddError(error);
}

function AddErrorToDisplay(error)
{
	var newNode = htmlNodeForError(error);

	document.querySelector("#pattern-errors").appendChild(newNode);
}

function htmlNodeForError(error)
{
	var newNode = document.createElement('div');
	newNode.classList.add('error');
	newNode.innerHTML = error.message;

	return newNode;
}

function ClearErrorDisplay()
{
	var errorDisplayNode = document.querySelector("#pattern-errors");

	var errorNodes = document.querySelectorAll("#pattern-errors .error");

	if (errorNodes)
	{
		errorNodes.forEach(errorNode => errorDisplayNode.removeChild(errorNode));
	}
}


// ---------------
// Event Handlers:
// ---------------

function UI_AddStitch(stitch)
{
	if (currentRowIndex >= 0)
	{
		if (stitch.stitchesDropped <= getCurrentRow().stitchesRemaining)
		{
			AddStitchToModel(stitch);
			AddStitchToDisplay(stitch);
		}
		else
		{
			var errorMessage = "Can't add stitch " + stitch.stitchCode + " to row; need " + stitch.stitchesDropped + " stitches but only " + getCurrentRow().stitchesRemaining + " stitches remaining.";

			AddRowError(errorMessage);
		}
	}
	else
	{
		AddError("No rows in pattern; can't add stitch " + stitch + " to current row.");
	}
}

function UI_AddNewRow()
{
	var newRow = Row(currentPattern.lastRowWidth);

	currentRowIndex++;

	AddRowToModel(newRow);
	AddRowToDisplay(newRow);
}

function UI_NewPattern()
{
	ClearPatternDisplay();
	ClearErrorDisplay();

	var newPattern = Pattern(GetCastOnValue());

	currentPattern = newPattern; // currentPattern should never be null or undefined!! or at beginning?
	currentRowIndex = -1;

	AddCurrentPatternToDisplay();
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

		var btn_stitchOpSequence = document.querySelector('#btn_stitchop-sequence');

		if (btn_stitchOpSequence)
		{
			btn_stitchOpSequence.addEventListener('click', () => UI_AddStitch(Sequence()));	
		}
	}
}