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
	var PublicAPI = {
		stitchesAdded: stitchesAdded, // ensure this is a nat
		stitchesDropped: stitchesDropped, // ensure this is a nat
		stitchCode: stitchCode, // ensure this is a string
	};

	PublicAPI.stitchID = "stitch-" + sessionStitchCounter;
	sessionStitchCounter++;

	// Object.defineProperty(PublicAPI, "stitchID",
	// {
	// 	set: function(val)
	// 		{
	// 			this._stitchID_ = val;
	// 			sessionStitchCounter++;
	// 		},
	// 	get: function()
	// 		{
	// 			return this._stitchID_;
	// 		},
	// 	enumerable: true
	// });

	return PublicAPI;
}

//var knit = new Stitch(1, 1, "K");
function knit()
{
	return Stitch(1, 1, "K");
}

function purl()
{
	return Stitch(1, 1, "P");
}

function slip()
{
	return Stitch(1, 1, "S");
}

function yarnover()
{
	return Stitch(1, 0, "YO");	
}

function knittogether(count)
{
	Stitch(1, count,knit().stitchCode + count + "T");
}

function purltogether(count)
{
	Stitch(1, count,purl().stitchCode + count + "T");
}

function emptyStitch()
{
	Stitch(0, 0, "-");
}


var sessionStitchCounter = 0;

function Repeat(stitch = emptyStitch, repCount = 1, stitchCode = stitch.stitchCode + repCount)
{
	var newStitchCode = stitchCode;

	if (stitch.isRepeat)
	{
		newStitchCode = "(" + stitch.stitchCode + ")" + repCount;
	}

	var PublicAPI = {
		stitchesAdded: stitch.stitchesAdded * repCount,
		stitchesDropped: stitch.stitchesDropped * repCount,
		stitchCode: newStitchCode
	}

	Object.defineProperty(PublicAPI, "isStitchOp",
		{
			value: true,
			writable: false,
			configurable: false,
			enumerable: true
		});

	Object.defineProperty(PublicAPI, "isRepeat",
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

	return PublicAPI;
}

// TODO: let instead of var?
function Sequence(initialContents = [])
{
	var contents = initialContents;

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

	Object.defineProperty(PublicAPI, "isSequence",
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


function NatNumberDivide(dividend, divisor)
{
	var quotient = 0;
	var remainder = 0;

	if (divisor > 0)
	{
		while (divisor * quotient + remainder < dividend)
		{
			if (divisor * (quotient + 1) + remainder <= dividend)
			{
				quotient++;
			}
			else
			{
				remainder++;
			}
		}
	}

	// check for error if divisor * quotient + remainder > dividend?
	// use aspectJS for postcondition?

	return {
		quotient: quotient,
		remainder: remainder
	}
}


function Row(stitchesStart)
{
	
	// TODO: use proper division and remainder functions
	function UndeterminedRepeat(stitch)
	{
		var divisor = stitch.stitchesDropped;
		var dividend = stitchesRemaining;

		if (divisor <= 0 || dividend < 0)
		{
			// TODO: need error to break everything... and different error if things are falsy due to being undefined
			console.log("ABORT! ABORT! cannot perform undetermined repeat!");
		}

		var quotient = NatNumberDivide(dividend, divisor).quotient;

		var newCompoundStitch = Repeat(stitch, quotient, "*" + stitch.stitchCode + "*");

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

	// forces size of new row to initially be the 
	// width of the previous row (at its end)
	// maybe don't force this? allow arbitrary row to be added?
	function AddNewRow()
	{
		checkPatternCorrectness();

		rows.push(Row(this.lastRowWidth));
	}

	function getLastRow()
	{
		return rows[rows.length - 1]
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


// ------------------------------------------------------
// Correctness
// ------------------------------------------------------
function checkPatternCorrectness(pattern)
{
	function RowError(message, rowIndex = currentRowIndex)
	{
		var errorMessage = "(Error) " + message;

		return {
			message: errorMessage,
			rowIndex: rowIndex
		};
	}

	// Error for when too many stitches in a row are used
	function OverusedStitchesError(stitchOveruse, rowIndex)
	{
		var stitchOrStitches = (stitchOveruse === 1) ? "stitch" : "stitches";
		var errorMessage = "Overuse of stitches: " + stitchOveruse + " more " + stitchOrStitches
							+ " used than available in row " + (rowIndex + 1);

		return RowError(errorMessage, rowIndex);
	}

	// Error for when not all stitches of a row are used
	function RemainingStitchesError(stitchesRemaining, rowIndex)
	{
		var stitchOrStitches = (stitchesRemaining === 1) ? "stitch" : "stitches";
		var errorMessage = "Unused stitches: " + stitchesRemaining + " " + stitchOrStitches
							+ " remaining in row " + (rowIndex + 1);

		return RowError(errorMessage, rowIndex);
	}

	// This error should not occur with the current GUI;
	// by construction consecutive rows have same number for stitches at the end of the first and stitches at the start of the second.
	function AdjacentRowError(row1StitchesEnd, row1Index, row2StitchesStart)
	{
		var errorMessage = "Adjacent row stitch count mismatch - " + row1StitchesEnd
							+ " stitches at the end of row " + (row1Index + 1)
							+ "and " + row2StitchesStart + " stitches at the start of row "
							+ (row1Index + 2);

		return RowError(errorMessage, row1Index);
	}

	// Should be run whenever a new row or stitch is added to the specified pattern
	if (pattern)
	{
		pattern.errors = [];

		for (let rowIndex = 0; rowIndex < pattern.rows.length; rowIndex++)
		{
			var overuseOfStitchesInRow = pattern.rows[rowIndex].stitchesRemaining < 0;

			if (overuseOfStitchesInRow)
			{
				var stitchOveruse = pattern.rows[rowIndex].stitchesRemaining * (-1);

				pattern.errors.push(OverusedStitchesError(stitchOveruse, rowIndex));
			}


			var notFinalRow = rowIndex + 1 < pattern.rows.length

			if (notFinalRow)
			{
				var currentRowStitchesEnd = pattern.rows[rowIndex].stitchesEnd;
				var nextRowStitchesStart = pattern.rows[rowIndex + 1].stitchesStart;

				if (currentRowStitchesEnd !== nextRowStitchesStart)
				{
					pattern.errors.push(AdjacentRowError(currentRowStitchesEnd, rowIndex, nextRowStitchesStart))
				}
			}

			if (rowIndex < pattern.rows.length && rowIndex !== currentRowIndex)
			{
				var currentRowStitchesRemaining = pattern.rows[rowIndex].stitchesRemaining;

				if (currentRowStitchesRemaining > 0)
				{
					pattern.errors.push(RemainingStitchesError(currentRowStitchesRemaining, rowIndex));
				}
			}
		}
	}
	else
	{
		// TODO: program error... checking correctness of undefined pattern
		console.log("Pattern passed to correctness check is " + pattern);
	}
}


// ------------------------------------------------------
// ------------------------------------------------------
// Program Logic
// ------------------------------------------------------
// ------------------------------------------------------

function GetCastOnValue()
{
	// require that this input is numeric, and function returns a number
	return Number(document.querySelector('#cast-on-input').value);
}



// Program State:

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

function SelectStitch(stitchNode)
{
	var selectedStitches = document.querySelectorAll('.stitch-is-selected');

	selectedStitches.forEach(st => st.classList.remove('stitch-is-selected'));

	stitchNode.classList.add('stitch-is-selected');
}


function AddStitchToDisplay(stitch)
{
	var newStitchNode = htmlNodeForStitch(stitch);
	newStitchNode.addEventListener('click', () => SelectStitch(newStitchNode));

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
	newNode.id = stitch.stitchID;

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

// Necessary?
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

// necessary?
function ClearErrorDisplay()
{
	var errorDisplayNode = document.querySelector("#pattern-errors");

	var errorNodes = document.querySelectorAll("#pattern-errors .error");

	if (errorNodes)
	{
		errorNodes.forEach(errorNode => errorDisplayNode.removeChild(errorNode));
	}
}

function CheckPatternAndUpdateErrors()
{
	ClearErrorDisplay();

	checkPatternCorrectness(currentPattern);
	var errorListElement = document.querySelector("#pattern-errors");

	currentPattern.errors.forEach(
		function (err)
		{
			var errorNode = htmlNodeForError(err);
			errorListElement.appendChild(errorNode);
		});
}


// ---------------
// Event Handlers:
// ---------------

function UI_AddStitch(stitch)
{
	if (currentPattern)
	{
		if (currentRowIndex >= 0)
		{
			AddStitchToModel(stitch);
			AddStitchToDisplay(stitch);
	
			CheckPatternAndUpdateErrors();
		}
		else
		{
			// Should have a different kind of error... UI error? should currentRowIndex always be nonneg?
			console.log("No rows in pattern; can't add stitch " + stitch + " to current row.");
		}
	}
	else
	{
		// TODO: user error... no current pattern
		console.log("No current pattern.");
	}
}

function UI_AddNewRow()
{
	if (currentPattern)
	{
		var newRow = Row(currentPattern.lastRowWidth);
	
		currentRowIndex++;
	
		AddRowToModel(newRow);
		AddRowToDisplay(newRow);

		CheckPatternAndUpdateErrors();
	}
	else
	{
		// TODO: user error... no current pattern
		console.log("No current pattern.");
	}
}

function UI_NewPattern()
{
	ClearPatternDisplay();

	var newPattern = Pattern(GetCastOnValue());

	currentPattern = newPattern; // currentPattern should never be null or undefined!! or at beginning?
	currentRowIndex = -1;

	AddCurrentPatternToDisplay();
}


function onKeyUp(e)
{
	// TODO:
	// get selected stitch if any and do appropriate thing based on key press
	// need to get parent too?
	var selectedStitches = document.querySelectorAll('.stitch-is-selected');
	// TODO: better way to make sure only one stitch selected?

	if (selectedStitches.length === 1)
	{
		var selectedStitchNode = selectedStitches[0];

		switch (e.keyCode)
		{
			case 8: 	// backspace
			case 46: 	// delete
				for (let rowIndex = 0; rowIndex < currentPattern.rows.length; rowIndex++)
				{
					for (let stIndex = 0; stIndex < currentPattern.rows[rowIndex].stitches.length; stIndex++)
					{
						var focusStitch = currentPattern.rows[rowIndex].stitches[stIndex];
						if (focusStitch.stitchID === selectedStitchNode.id)
						{
							currentPattern.rows[rowIndex].stitches.splice(stIndex, 1);
						}
					}
				}

				CheckPatternAndUpdateErrors();
				break;
			case 13: 	// enter 
				break;
			case 9: 	// tab
			case 39: 	// right arrow
				break;
			case 37: 	// left arrow
				break;
		}
	}
}


// TODO: how to test when elements from original page are null here?
document.onreadystatechange = function(e)
{
    if (document.readyState === 'complete')
    {
    	document.addEventListener('keyup', onKeyUp);

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
    		btn_stitchKnit.addEventListener('click', () => UI_AddStitch(knit()));
		}

		var btn_stitchPurl = document.querySelector('#btn_stitch-purl');

		if (btn_stitchPurl)
		{
			btn_stitchPurl.addEventListener('click', () => UI_AddStitch(purl()));
		}

		var btn_stitchYarnover = document.querySelector('#btn_stitch-yarnover');

		if (btn_stitchYarnover)
		{
			btn_stitchYarnover.addEventListener('click', () => UI_AddStitch(yarnover()));
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
