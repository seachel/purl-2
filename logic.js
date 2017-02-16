"use strict"

// correctness options:
//  1.  - compute stitch sequence as stitch, so content of row is a "stitch"
//		- assume that number of stitches dropped is the correct amount for the start of the row
//		- in sequence of rows, stitches added in one row should equal the number of stitches dropped in the next row (unless allowing short rows; this will be handled later)

// need stitch codes
// sequences and repeats are stitches too?

function Stitch(stitchesAdded, stitchesDropped, stitchCode="no-code") {
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


function Row(stitchesStart) {

	// public functions for constructing stitches and modifying row contents

	function Repeat(stitch, repCount, stitchCode = stitch.stitchCode + repCount) {
		var newCompoundStitch = Stitch(stitch.stitchesAdded * repCount,
					  		   stitch.stitchesDropped * repCount,
					  		   stitchCode)

		return newCompoundStitch;
	}

	// TODO: use proper division and remainder functions
	function UndeterminedRepeat(stitch) {
		var divisor = 0;
		var remainder = stitchesRemaining;

		if (remainder >= stitch.stitchesDropped) {
			while (remainder >= stitch.stitchesDropped) {
				remainder -= stitch.stitchesDropped;
				divisor++;
			}		
		} else {
			// TODO: need error to break everything... and different error if things are falsy due to being undefined
			console.log("ABORT! ABORT! cannot perform undetermined repeat!");
		}

		var newCompoundStitch = Repeat(stitch, divisor, "*" + stitch.stitchCode + "*");

		return newCompoundStitch;
	}

	// TODO: accept a list of arguments; use spread
	// TODO: let instead of var?
	function Sequence(stitch1, stitch2) {
		var addedBySequence = stitch1.stitchesAdded + stitch2.stitchesAdded;
		var droppedBySequence = stitch1.stitchesDropped + stitch2.stitchesDropped;

		var newCompoundStitch = Stitch(addedBySequence,
									   droppedBySequence,
									   "(" + stitch1.stitchCode + ", " + stitch2.stitchCode + ")");

		return newCompoundStitch;
	}

	function AddStitch(stitch) {
		stitches.push(stitch);
	}



	// private helper functions

	function getTotalStitchesAdded() {
	 	return stitches.reduce(
	 		((partialResult, currentStitch) =>
	 			 partialResult + currentStitch.stitchesAdded), 0
	 	);
	}

	function getTotalStitchesDropped() {
		return stitches.reduce(
	 		((partialResult, currentStitch) =>
	 			 partialResult + currentStitch.stitchesDropped), 0
	 	);
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

	Object.defineProperty(PublicAPI, "stitchesStart", {
		value: stitchesStart,
		writable: false,
		configurable: false,
		enumerable: true
	});

	Object.defineProperty(PublicAPI, "stitchesEnd", {
		get: () => getTotalStitchesAdded(),
		enumerable: true
	});

	Object.defineProperty(PublicAPI, "stitchesRemaining", {
		get: () => stitchesStart - getTotalStitchesDropped(),
		enumerable: true
	});

	return PublicAPI;
}

function Pattern() {

	var rows = [];

	function CastOn(coValue) {
		castOnValue = coValue;
	}

	function AddRow(row) {
		//TODO: some check on row to make sure it is valid?
		rows.push(row);
	}

	return {
		castOnValue: 0,
		rows: rows
	}
}