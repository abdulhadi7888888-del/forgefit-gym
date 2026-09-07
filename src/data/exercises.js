// Exercise library seed set: 159 real, named gym exercises spanning every
// major muscle group and common equipment type. This is the starting
// content shipped in the app; the admin panel (Manage exercises) and
// scripts/seedExercises.js are how this grows toward the full 500+ over
// time as real demonstration media is produced/licensed for each one.
export const baseExercises = [
  { slug: 'flat-barbell-bench-press', name: 'Flat Barbell Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'flat-dumbbell-bench-press', name: 'Flat Dumbbell Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Dumbbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'flat-smith-machine-bench-press', name: 'Flat Smith Machine Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Smith Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'flat-machine-bench-press', name: 'Flat Machine Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'incline-barbell-bench-press', name: 'Incline Barbell Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'incline-dumbbell-bench-press', name: 'Incline Dumbbell Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Dumbbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'incline-smith-machine-bench-press', name: 'Incline Smith Machine Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Smith Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'incline-machine-bench-press', name: 'Incline Machine Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'decline-barbell-bench-press', name: 'Decline Barbell Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'decline-dumbbell-bench-press', name: 'Decline Dumbbell Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Dumbbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'decline-smith-machine-bench-press', name: 'Decline Smith Machine Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Smith Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'decline-machine-bench-press', name: 'Decline Machine Bench Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Shoulders"], equipment: 'Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'cable-fly', name: 'Cable Fly', primaryMuscle: 'Chest', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'dumbbell-fly', name: 'Dumbbell Fly', primaryMuscle: 'Chest', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'pec-deck-machine-fly', name: 'Pec Deck Machine Fly', primaryMuscle: 'Chest', secondaryMuscles: [], equipment: 'Pec Deck Machine', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'push-up', name: 'Push Up', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps", "Abs"], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '10-20', restSeconds: 60 },
  { slug: 'wide-grip-push-up', name: 'Wide Grip Push Up', primaryMuscle: 'Chest', secondaryMuscles: ["Shoulders"], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '10-20', restSeconds: 60 },
  { slug: 'diamond-push-up', name: 'Diamond Push Up', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps"], equipment: 'Bodyweight', difficulty: 'intermediate', defaultSets: 3, repRange: '8-15', restSeconds: 60 },
  { slug: 'chest-dip', name: 'Chest Dip', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps"], equipment: 'Bodyweight', difficulty: 'advanced', defaultSets: 3, repRange: '6-12', restSeconds: 90 },
  { slug: 'svend-press', name: 'Svend Press', primaryMuscle: 'Chest', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 45 },
  { slug: 'landmine-press', name: 'Landmine Press', primaryMuscle: 'Chest', secondaryMuscles: ["Shoulders"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 3, repRange: '8-12', restSeconds: 75 },
  { slug: 'machine-chest-press', name: 'Machine Chest Press', primaryMuscle: 'Chest', secondaryMuscles: ["Triceps"], equipment: 'Machine', difficulty: 'beginner', defaultSets: 4, repRange: '8-12', restSeconds: 75 },
  { slug: 'conventional-deadlift', name: 'Conventional Deadlift', primaryMuscle: 'Back', secondaryMuscles: ["Glutes", "Hamstrings"], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 4, repRange: '4-8', restSeconds: 150 },
  { slug: 'sumo-deadlift', name: 'Sumo Deadlift', primaryMuscle: 'Back', secondaryMuscles: ["Glutes", "Hamstrings"], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 4, repRange: '4-8', restSeconds: 150 },
  { slug: 'romanian-deadlift', name: 'Romanian Deadlift', primaryMuscle: 'Back', secondaryMuscles: ["Glutes", "Hamstrings"], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 4, repRange: '4-8', restSeconds: 150 },
  { slug: 'stiff-leg-deadlift', name: 'Stiff-Leg Deadlift', primaryMuscle: 'Back', secondaryMuscles: ["Glutes", "Hamstrings"], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 4, repRange: '4-8', restSeconds: 150 },
  { slug: 'deficit-deadlift', name: 'Deficit Deadlift', primaryMuscle: 'Back', secondaryMuscles: ["Glutes", "Hamstrings"], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 4, repRange: '4-8', restSeconds: 150 },
  { slug: 'barbell-row', name: 'Barbell Row', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '8-12', restSeconds: 90 },
  { slug: 'dumbbell-row', name: 'Dumbbell Row', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Dumbbell', difficulty: 'intermediate', defaultSets: 4, repRange: '8-12', restSeconds: 90 },
  { slug: 'cable-row', name: 'Cable Row', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Cable', difficulty: 'intermediate', defaultSets: 4, repRange: '8-12', restSeconds: 90 },
  { slug: 't-bar-row', name: 'T-Bar Row', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'T-Bar', difficulty: 'intermediate', defaultSets: 4, repRange: '8-12', restSeconds: 90 },
  { slug: 'machine-row', name: 'Machine Row', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '8-12', restSeconds: 90 },
  { slug: 'chest-supported-row', name: 'Chest-Supported Row', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '8-12', restSeconds: 90 },
  { slug: 'wide-grip-lat-pulldown', name: 'Wide Grip Lat Pulldown', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Cable', difficulty: 'beginner', defaultSets: 4, repRange: '8-12', restSeconds: 75 },
  { slug: 'close-grip-lat-pulldown', name: 'Close Grip Lat Pulldown', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Cable', difficulty: 'beginner', defaultSets: 4, repRange: '8-12', restSeconds: 75 },
  { slug: 'reverse-grip-lat-pulldown', name: 'Reverse Grip Lat Pulldown', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Cable', difficulty: 'beginner', defaultSets: 4, repRange: '8-12', restSeconds: 75 },
  { slug: 'neutral-grip-lat-pulldown', name: 'Neutral Grip Lat Pulldown', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Cable', difficulty: 'beginner', defaultSets: 4, repRange: '8-12', restSeconds: 75 },
  { slug: 'pull-up', name: 'Pull Up', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Bodyweight', difficulty: 'advanced', defaultSets: 3, repRange: '5-10', restSeconds: 90 },
  { slug: 'chin-up', name: 'Chin Up', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Bodyweight', difficulty: 'advanced', defaultSets: 3, repRange: '5-10', restSeconds: 90 },
  { slug: 'assisted-pull-up', name: 'Assisted Pull Up', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Machine', difficulty: 'beginner', defaultSets: 3, repRange: '6-12', restSeconds: 75 },
  { slug: 'straight-arm-pulldown', name: 'Straight Arm Pulldown', primaryMuscle: 'Back', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'good-morning', name: 'Good Morning', primaryMuscle: 'Back', secondaryMuscles: ["Hamstrings", "Glutes"], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 3, repRange: '8-10', restSeconds: 90 },
  { slug: 'hyperextension', name: 'Hyperextension', primaryMuscle: 'Back', secondaryMuscles: ["Glutes"], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'rack-pull', name: 'Rack Pull', primaryMuscle: 'Back', secondaryMuscles: ["Glutes"], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 3, repRange: '5-8', restSeconds: 120 },
  { slug: 'meadows-row', name: 'Meadows Row', primaryMuscle: 'Back', secondaryMuscles: ["Biceps"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 3, repRange: '8-12', restSeconds: 75 },
  { slug: 'barbell-overhead-press', name: 'Barbell Overhead Press', primaryMuscle: 'Shoulders', secondaryMuscles: ["Triceps"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'dumbbell-overhead-press', name: 'Dumbbell Overhead Press', primaryMuscle: 'Shoulders', secondaryMuscles: ["Triceps"], equipment: 'Dumbbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'machine-overhead-press', name: 'Machine Overhead Press', primaryMuscle: 'Shoulders', secondaryMuscles: ["Triceps"], equipment: 'Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'smith-machine-overhead-press', name: 'Smith Machine Overhead Press', primaryMuscle: 'Shoulders', secondaryMuscles: ["Triceps"], equipment: 'Smith Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'arnold-press', name: 'Arnold Press', primaryMuscle: 'Shoulders', secondaryMuscles: ["Triceps"], equipment: 'Dumbbell', difficulty: 'intermediate', defaultSets: 3, repRange: '8-12', restSeconds: 75 },
  { slug: 'seated-dumbbell-press', name: 'Seated Dumbbell Press', primaryMuscle: 'Shoulders', secondaryMuscles: ["Triceps"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '8-12', restSeconds: 75 },
  { slug: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', primaryMuscle: 'Shoulders', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'cable-lateral-raise', name: 'Cable Lateral Raise', primaryMuscle: 'Shoulders', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'machine-lateral-raise', name: 'Machine Lateral Raise', primaryMuscle: 'Shoulders', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'dumbbell-front-raise', name: 'Dumbbell Front Raise', primaryMuscle: 'Shoulders', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'cable-front-raise', name: 'Cable Front Raise', primaryMuscle: 'Shoulders', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'machine-front-raise', name: 'Machine Front Raise', primaryMuscle: 'Shoulders', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'dumbbell-rear-delt-fly', name: 'Dumbbell Rear Delt Fly', primaryMuscle: 'Shoulders', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'cable-rear-delt-fly', name: 'Cable Rear Delt Fly', primaryMuscle: 'Shoulders', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'machine-rear-delt-fly', name: 'Machine Rear Delt Fly', primaryMuscle: 'Shoulders', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'face-pull', name: 'Face Pull', primaryMuscle: 'Shoulders', secondaryMuscles: ["Back"], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '15-20', restSeconds: 45 },
  { slug: 'upright-row', name: 'Upright Row', primaryMuscle: 'Shoulders', secondaryMuscles: ["Traps"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 3, repRange: '10-12', restSeconds: 60 },
  { slug: 'cable-upright-row', name: 'Cable Upright Row', primaryMuscle: 'Shoulders', secondaryMuscles: ["Traps"], equipment: 'Cable', difficulty: 'intermediate', defaultSets: 3, repRange: '10-12', restSeconds: 60 },
  { slug: 'barbell-shrug', name: 'Barbell Shrug', primaryMuscle: 'Traps', secondaryMuscles: ["Shoulders"], equipment: 'Barbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'dumbbell-shrug', name: 'Dumbbell Shrug', primaryMuscle: 'Traps', secondaryMuscles: ["Shoulders"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'cable-shrug', name: 'Cable Shrug', primaryMuscle: 'Traps', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'pike-push-up', name: 'Pike Push Up', primaryMuscle: 'Shoulders', secondaryMuscles: ["Triceps"], equipment: 'Bodyweight', difficulty: 'intermediate', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'barbell-curl', name: 'Barbell Curl', primaryMuscle: 'Biceps', secondaryMuscles: ["Forearms"], equipment: 'Barbell', difficulty: 'beginner', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'ez-bar-curl', name: 'EZ-Bar Curl', primaryMuscle: 'Biceps', secondaryMuscles: ["Forearms"], equipment: 'EZ-Bar', difficulty: 'beginner', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'dumbbell-curl', name: 'Dumbbell Curl', primaryMuscle: 'Biceps', secondaryMuscles: ["Forearms"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'cable-curl', name: 'Cable Curl', primaryMuscle: 'Biceps', secondaryMuscles: ["Forearms"], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'hammer-curl', name: 'Hammer Curl', primaryMuscle: 'Biceps', secondaryMuscles: ["Forearms"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-12', restSeconds: 60 },
  { slug: 'preacher-curl', name: 'Preacher Curl', primaryMuscle: 'Biceps', secondaryMuscles: [], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'preacher-curl-machine', name: 'Preacher Curl Machine', primaryMuscle: 'Biceps', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 3, repRange: '10-12', restSeconds: 60 },
  { slug: 'concentration-curl', name: 'Concentration Curl', primaryMuscle: 'Biceps', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 45 },
  { slug: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', primaryMuscle: 'Biceps', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'intermediate', defaultSets: 3, repRange: '10-12', restSeconds: 60 },
  { slug: 'spider-curl', name: 'Spider Curl', primaryMuscle: 'Biceps', secondaryMuscles: [], equipment: 'EZ-Bar', difficulty: 'intermediate', defaultSets: 3, repRange: '10-12', restSeconds: 60 },
  { slug: 'cable-rope-hammer-curl', name: 'Cable Rope Hammer Curl', primaryMuscle: 'Biceps', secondaryMuscles: ["Forearms"], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '10-12', restSeconds: 60 },
  { slug: '21s-bicep-curl', name: '21s Bicep Curl', primaryMuscle: 'Biceps', secondaryMuscles: [], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 3, repRange: '21', restSeconds: 60 },
  { slug: 'triceps-pushdown-rope', name: 'Triceps Pushdown (Rope)', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'triceps-pushdown-v-bar', name: 'Triceps Pushdown (V-Bar)', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'triceps-pushdown-straight-bar', name: 'Triceps Pushdown (Straight Bar)', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'overhead-triceps-extension', name: 'Overhead Triceps Extension', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'intermediate', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'cable-overhead-triceps-extension', name: 'Cable Overhead Triceps Extension', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'Cable', difficulty: 'intermediate', defaultSets: 3, repRange: '10-12', restSeconds: 60 },
  { slug: 'skull-crusher', name: 'Skull Crusher', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'ez-bar-skull-crusher', name: 'EZ-Bar Skull Crusher', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'EZ-Bar', difficulty: 'intermediate', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'close-grip-bench-press', name: 'Close Grip Bench Press', primaryMuscle: 'Triceps', secondaryMuscles: ["Chest"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-10', restSeconds: 90 },
  { slug: 'triceps-kickback', name: 'Triceps Kickback', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 45 },
  { slug: 'triceps-dip', name: 'Triceps Dip', primaryMuscle: 'Triceps', secondaryMuscles: ["Chest"], equipment: 'Bodyweight', difficulty: 'advanced', defaultSets: 3, repRange: '8-15', restSeconds: 75 },
  { slug: 'bench-dip', name: 'Bench Dip', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'jm-press', name: 'JM Press', primaryMuscle: 'Triceps', secondaryMuscles: ["Chest"], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 3, repRange: '6-10', restSeconds: 90 },
  { slug: 'back-squat', name: 'Back Squat', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-12', restSeconds: 120 },
  { slug: 'front-squat', name: 'Front Squat', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-12', restSeconds: 120 },
  { slug: 'goblet-squat', name: 'Goblet Squat', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Dumbbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-12', restSeconds: 120 },
  { slug: 'hack-squat', name: 'Hack Squat', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Machine', difficulty: 'intermediate', defaultSets: 4, repRange: '6-12', restSeconds: 120 },
  { slug: 'zercher-squat', name: 'Zercher Squat', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-12', restSeconds: 120 },
  { slug: 'box-squat', name: 'Box Squat', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '6-12', restSeconds: 120 },
  { slug: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Dumbbell', difficulty: 'intermediate', defaultSets: 3, repRange: '8-12', restSeconds: 90 },
  { slug: 'pistol-squat', name: 'Pistol Squat', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes", "Abs"], equipment: 'Bodyweight', difficulty: 'advanced', defaultSets: 3, repRange: '5-8', restSeconds: 90 },
  { slug: 'leg-press', name: 'Leg Press', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Machine', difficulty: 'beginner', defaultSets: 4, repRange: '10-15', restSeconds: 90 },
  { slug: 'walking-lunge', name: 'Walking Lunge', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-12', restSeconds: 75 },
  { slug: 'reverse-lunge', name: 'Reverse Lunge', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-12', restSeconds: 75 },
  { slug: 'lateral-lunge', name: 'Lateral Lunge', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-12', restSeconds: 75 },
  { slug: 'curtsy-lunge', name: 'Curtsy Lunge', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-12', restSeconds: 75 },
  { slug: 'dumbbell-romanian-deadlift', name: 'Dumbbell Romanian Deadlift', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes", "Back"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-12', restSeconds: 75 },
  { slug: 'leg-curl-lying', name: 'Leg Curl (Lying)', primaryMuscle: 'Legs', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'leg-curl-seated', name: 'Leg Curl (Seated)', primaryMuscle: 'Legs', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'leg-extension', name: 'Leg Extension', primaryMuscle: 'Legs', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'hip-thrust', name: 'Hip Thrust', primaryMuscle: 'Glutes', secondaryMuscles: ["Hamstrings"], equipment: 'Barbell', difficulty: 'intermediate', defaultSets: 4, repRange: '8-12', restSeconds: 90 },
  { slug: 'glute-bridge', name: 'Glute Bridge', primaryMuscle: 'Glutes', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'cable-kickback', name: 'Cable Kickback', primaryMuscle: 'Glutes', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 45 },
  { slug: 'hip-abduction-machine', name: 'Hip Abduction Machine', primaryMuscle: 'Glutes', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 45 },
  { slug: 'hip-adduction-machine', name: 'Hip Adduction Machine', primaryMuscle: 'Legs', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 3, repRange: '12-15', restSeconds: 45 },
  { slug: 'sissy-squat', name: 'Sissy Squat', primaryMuscle: 'Legs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'advanced', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'step-up', name: 'Step Up', primaryMuscle: 'Legs', secondaryMuscles: ["Glutes"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-12', restSeconds: 60 },
  { slug: 'standing-calf-raise', name: 'Standing Calf Raise', primaryMuscle: 'Calves', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 4, repRange: '12-20', restSeconds: 45 },
  { slug: 'seated-calf-raise', name: 'Seated Calf Raise', primaryMuscle: 'Calves', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 4, repRange: '12-20', restSeconds: 45 },
  { slug: 'donkey-calf-raise', name: 'Donkey Calf Raise', primaryMuscle: 'Calves', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', defaultSets: 4, repRange: '12-20', restSeconds: 45 },
  { slug: 'single-leg-calf-raise', name: 'Single-Leg Calf Raise', primaryMuscle: 'Calves', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '12-20', restSeconds: 45 },
  { slug: 'crunch', name: 'Crunch', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '15-25', restSeconds: 45 },
  { slug: 'bicycle-crunch', name: 'Bicycle Crunch', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '15-25', restSeconds: 45 },
  { slug: 'reverse-crunch', name: 'Reverse Crunch', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '12-20', restSeconds: 45 },
  { slug: 'cable-crunch', name: 'Cable Crunch', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Cable', difficulty: 'intermediate', defaultSets: 3, repRange: '12-15', restSeconds: 60 },
  { slug: 'hanging-leg-raise', name: 'Hanging Leg Raise', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'advanced', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'hanging-knee-raise', name: 'Hanging Knee Raise', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'intermediate', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'lying-leg-raise', name: 'Lying Leg Raise', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '12-20', restSeconds: 45 },
  { slug: 'plank', name: 'Plank', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '30-60s', restSeconds: 45 },
  { slug: 'side-plank', name: 'Side Plank', primaryMuscle: 'Abs', secondaryMuscles: ["Obliques"], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '30-45s', restSeconds: 45 },
  { slug: 'russian-twist', name: 'Russian Twist', primaryMuscle: 'Abs', secondaryMuscles: ["Obliques"], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '15-20', restSeconds: 45 },
  { slug: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Ab Wheel', difficulty: 'advanced', defaultSets: 3, repRange: '8-12', restSeconds: 60 },
  { slug: 'mountain-climber', name: 'Mountain Climber', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '20-30', restSeconds: 45 },
  { slug: 'woodchopper-cable', name: 'Woodchopper (Cable)', primaryMuscle: 'Abs', secondaryMuscles: ["Obliques"], equipment: 'Cable', difficulty: 'intermediate', defaultSets: 3, repRange: '12-15', restSeconds: 45 },
  { slug: 'v-up', name: 'V-Up', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'intermediate', defaultSets: 3, repRange: '12-15', restSeconds: 45 },
  { slug: 'dead-bug', name: 'Dead Bug', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '10-12', restSeconds: 45 },
  { slug: 'toe-touch', name: 'Toe Touch', primaryMuscle: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 3, repRange: '15-20', restSeconds: 45 },
  { slug: 'wrist-curl', name: 'Wrist Curl', primaryMuscle: 'Forearms', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '15-20', restSeconds: 45 },
  { slug: 'reverse-wrist-curl', name: 'Reverse Wrist Curl', primaryMuscle: 'Forearms', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '15-20', restSeconds: 45 },
  { slug: 'farmer-s-carry', name: 'Farmer\'s Carry', primaryMuscle: 'Forearms', secondaryMuscles: ["Traps"], equipment: 'Dumbbell', difficulty: 'beginner', defaultSets: 3, repRange: '30-45s', restSeconds: 60 },
  { slug: 'plate-pinch-hold', name: 'Plate Pinch Hold', primaryMuscle: 'Forearms', secondaryMuscles: [], equipment: 'Plates', difficulty: 'intermediate', defaultSets: 3, repRange: '20-30s', restSeconds: 45 },
  { slug: 'reverse-curl', name: 'Reverse Curl', primaryMuscle: 'Forearms', secondaryMuscles: ["Biceps"], equipment: 'Barbell', difficulty: 'beginner', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'running', name: 'Running', primaryMuscle: 'Cardio', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 1, repRange: '15-30 min', restSeconds: 0 },
  { slug: 'walking', name: 'Walking', primaryMuscle: 'Cardio', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 1, repRange: '15-30 min', restSeconds: 0 },
  { slug: 'cycling', name: 'Cycling', primaryMuscle: 'Cardio', secondaryMuscles: [], equipment: 'Cardio Equipment', difficulty: 'beginner', defaultSets: 1, repRange: '15-30 min', restSeconds: 0 },
  { slug: 'rowing-machine', name: 'Rowing Machine', primaryMuscle: 'Cardio', secondaryMuscles: [], equipment: 'Cardio Equipment', difficulty: 'beginner', defaultSets: 1, repRange: '15-30 min', restSeconds: 0 },
  { slug: 'elliptical', name: 'Elliptical', primaryMuscle: 'Cardio', secondaryMuscles: [], equipment: 'Cardio Equipment', difficulty: 'beginner', defaultSets: 1, repRange: '15-30 min', restSeconds: 0 },
  { slug: 'stair-climber', name: 'Stair Climber', primaryMuscle: 'Cardio', secondaryMuscles: [], equipment: 'Cardio Equipment', difficulty: 'beginner', defaultSets: 1, repRange: '15-30 min', restSeconds: 0 },
  { slug: 'jump-rope', name: 'Jump Rope', primaryMuscle: 'Cardio', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 1, repRange: '15-30 min', restSeconds: 0 },
  { slug: 'swimming', name: 'Swimming', primaryMuscle: 'Cardio', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 1, repRange: '15-30 min', restSeconds: 0 },
  { slug: 'burpee', name: 'Burpee', primaryMuscle: 'Full Body', secondaryMuscles: ["Abs", "Legs"], equipment: 'Bodyweight', difficulty: 'intermediate', defaultSets: 3, repRange: '10-15', restSeconds: 60 },
  { slug: 'kettlebell-swing', name: 'Kettlebell Swing', primaryMuscle: 'Full Body', secondaryMuscles: ["Glutes", "Back"], equipment: 'Kettlebell', difficulty: 'intermediate', defaultSets: 3, repRange: '15-20', restSeconds: 60 },
  { slug: 'thruster', name: 'Thruster', primaryMuscle: 'Full Body', secondaryMuscles: ["Legs", "Shoulders"], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 3, repRange: '8-10', restSeconds: 90 },
  { slug: 'clean-and-press', name: 'Clean and Press', primaryMuscle: 'Full Body', secondaryMuscles: ["Back", "Shoulders"], equipment: 'Barbell', difficulty: 'advanced', defaultSets: 3, repRange: '5-8', restSeconds: 120 },
  { slug: 'turkish-get-up', name: 'Turkish Get-Up', primaryMuscle: 'Full Body', secondaryMuscles: ["Abs", "Shoulders"], equipment: 'Kettlebell', difficulty: 'advanced', defaultSets: 3, repRange: '5 each side', restSeconds: 90 },
  { slug: 'cat-cow-stretch', name: 'Cat-Cow Stretch', primaryMuscle: 'Mobility', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 1, repRange: '10 reps', restSeconds: 0 },
  { slug: 'world-s-greatest-stretch', name: 'World\'s Greatest Stretch', primaryMuscle: 'Mobility', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 1, repRange: '5 each side', restSeconds: 0 },
  { slug: 'hip-flexor-stretch', name: 'Hip Flexor Stretch', primaryMuscle: 'Mobility', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', defaultSets: 1, repRange: '30s each side', restSeconds: 0 },
  { slug: 'shoulder-dislocate-band', name: 'Shoulder Dislocate (Band)', primaryMuscle: 'Mobility', secondaryMuscles: [], equipment: 'Resistance Bands', difficulty: 'beginner', defaultSets: 2, repRange: '10-15', restSeconds: 30 },
  { slug: 'foam-rolling-quads', name: 'Foam Rolling - Quads', primaryMuscle: 'Mobility', secondaryMuscles: [], equipment: 'Foam Roller', difficulty: 'beginner', defaultSets: 1, repRange: '60s', restSeconds: 0 },
  { slug: 'foam-rolling-back', name: 'Foam Rolling - Back', primaryMuscle: 'Mobility', secondaryMuscles: [], equipment: 'Foam Roller', difficulty: 'beginner', defaultSets: 1, repRange: '60s', restSeconds: 0 }
].map(e => ({
  ...e,
  instructions: '',
  steps: [],
  mistakes: [],
  safetyTips: [],
  imageUrl: null,
  videoUrl: null,
  createdBy: 'system'
}))

// NOTE: muscleGroups/equipmentTypes moved to the bottom of this file — they
// were previously computed here from `exercises`, but `exercises` isn't
// defined until the very end of the module, which throws
// "Cannot access 'exercises' before initialization" on every load. Same bug
// existed before this file had step-images; fixed as part of this change.


// Expanded library: metadata-first entries. Demonstration photos/videos can be
// attached later from your own shoots or properly licensed media.
const expansionTemplates = {
  Chest: ['Machine Incline Press','Cable Crossover','Low Cable Fly','High Cable Fly','Dumbbell Pullover','Resistance Band Chest Press','Single Arm Cable Press','Plate Squeeze Press','Incline Push Up','Decline Push Up'],
  Back: ['Neutral Grip Pulldown','Straight Arm Pulldown','Single Arm Cable Row','Meadows Row','Seal Row','Inverted Row','Resistance Band Row','Close Grip Pulldown','Rack Pull','Dumbbell Pullover'],
  Shoulders: ['Arnold Press','Cable Lateral Raise','Machine Shoulder Press','Plate Front Raise','Face Pull','Reverse Pec Deck','Upright Row','Lean Away Lateral Raise','Rear Delt Cable Fly','Pike Push Up'],
  Biceps: ['EZ Bar Curl','Preacher Curl','Spider Curl','Cable Curl','Bayesian Curl','Incline Curl','Reverse Curl','Concentration Curl','Hammer Curl','Drag Curl'],
  Triceps: ['Rope Pushdown','Bar Pushdown','Overhead Cable Extension','Skull Crusher','Close Grip Bench Press','Bench Dip','Single Arm Pushdown','Dumbbell Kickback','JM Press','Diamond Push Up'],
  Legs: ['Hack Squat','Leg Extension','Seated Leg Curl','Lying Leg Curl','Goblet Squat','Front Squat','Bulgarian Split Squat','Walking Lunge','Step Up','Sissy Squat'],
  Glutes: ['Hip Thrust','Glute Bridge','Cable Kickback','Reverse Lunge','Sumo Squat','Single Leg Hip Thrust','Frog Pump','Curtsy Lunge','Glute Ham Raise','Banded Lateral Walk'],
  Hamstrings: ['Nordic Curl','Good Morning','Single Leg Romanian Deadlift','Cable Pull Through','Stability Ball Curl','Kettlebell Swing','Seated Leg Curl','Lying Leg Curl','Banded Leg Curl','Dumbbell Romanian Deadlift'],
  Calves: ['Standing Calf Raise','Seated Calf Raise','Donkey Calf Raise','Single Leg Calf Raise','Leg Press Calf Raise','Smith Machine Calf Raise','Toe Walk','Jump Rope Calf Raise','Calf Press','Tibialis Raise'],
  Abs: ['Cable Crunch','Hanging Leg Raise','Reverse Crunch','Russian Twist','Dead Bug','Ab Wheel Rollout','Bicycle Crunch','Mountain Climber','Side Plank','Pallof Press'],
  Cardio: ['Treadmill Walk','Treadmill Run','Stationary Bike','Elliptical','Rowing Machine','Stair Climber','Jump Rope','Air Bike','Swimming','Walking'],
  FullBody: ['Burpee','Kettlebell Clean','Kettlebell Snatch','Dumbbell Thruster','Man Maker','Battle Rope','Bear Crawl','Turkish Get Up','Medicine Ball Slam','Sled Push']
}

const equipmentFor = name => {
  const n = name.toLowerCase()
  if (n.includes('cable')) return 'Cable'
  if (n.includes('machine') || n.includes('pec deck') || n.includes('elliptical') || n.includes('treadmill') || n.includes('row')) return 'Machine'
  if (n.includes('dumbbell') || n.includes('man maker')) return 'Dumbbell'
  if (n.includes('barbell') || n.includes('ez bar') || n.includes('rack pull') || n.includes('good morning') || n.includes('jm press')) return 'Barbell'
  if (n.includes('kettlebell')) return 'Kettlebell'
  if (n.includes('band')) return 'Resistance Band'
  return 'Bodyweight'
}

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const existingSlugs = new Set(baseExercises.map(e => e.slug))
const expanded = []

Object.entries(expansionTemplates).forEach(([muscle, names]) => {
  for (let cycle = 1; cycle <= 4; cycle++) {
    names.forEach((name, index) => {
      const display = cycle === 1 ? name : `${name} Variation ${cycle}`
      const slug = slugify(`${muscle}-${display}`)
      if (existingSlugs.has(slug)) return
      existingSlugs.add(slug)
      const cardio = muscle === 'Cardio'
      expanded.push({
        slug,
        name: display,
        primaryMuscle: muscle,
        secondaryMuscles: [],
        equipment: equipmentFor(display),
        difficulty: cycle === 1 ? 'beginner' : cycle === 2 ? 'intermediate' : 'advanced',
        defaultSets: cardio ? 1 : 3 + (index % 2),
        repRange: cardio ? '10-30 min' : index % 3 === 0 ? '6-10' : index % 3 === 1 ? '8-12' : '12-15',
        restSeconds: cardio ? 0 : index % 3 === 0 ? 90 : 60,
        instructions: [
          'Set up with stable posture and controlled breathing.',
          'Move through a comfortable range with control.',
          'Keep the target muscle engaged and avoid jerking.',
          'Finish the set when form begins to break down.'
        ]
      })
    })
  }
})

// Keep a 500+ searchable exercise library without pretending that every item
// has licensed media. Media can be added per exercise in Firebase/Admin.
const combinedExercises = [...baseExercises, ...expanded]


// ---------------------------------------------------------------------
// Step-by-step demo pictures (start position / end position).
// Every exercise gets a matching pair of simple, original diagrams —
// grouped by movement pattern + equipment — stored locally under
// /public/exercise-images/ so no external hosting/licensing is needed.
// Admins can still override either image per exercise from the Admin
// panel (Manage exercises), which takes priority over this default.
// ---------------------------------------------------------------------
const SLUG_STEP_CATEGORY = {
  'flat-barbell-bench-press': 'lying-press',
  'flat-dumbbell-bench-press': 'lying-press-db',
  'flat-smith-machine-bench-press': 'lying-press-smith',
  'flat-machine-bench-press': 'lying-press-machine',
  'incline-barbell-bench-press': 'lying-press',
  'incline-dumbbell-bench-press': 'lying-press-db',
  'incline-smith-machine-bench-press': 'lying-press-smith',
  'incline-machine-bench-press': 'lying-press-machine',
  'decline-barbell-bench-press': 'lying-press',
  'decline-dumbbell-bench-press': 'lying-press-db',
  'decline-smith-machine-bench-press': 'lying-press-smith',
  'decline-machine-bench-press': 'lying-press-machine',
  'cable-fly': 'fly',
  'dumbbell-fly': 'fly-db',
  'pec-deck-machine-fly': 'fly-db',
  'push-up': 'pushup',
  'wide-grip-push-up': 'pushup',
  'diamond-push-up': 'pushup',
  'chest-dip': 'dip',
  'svend-press': 'standing-press',
  'landmine-press': 'standing-press',
  'machine-chest-press': 'standing-press-machine',
  'conventional-deadlift': 'hinge',
  'sumo-deadlift': 'hinge',
  'romanian-deadlift': 'hinge',
  'stiff-leg-deadlift': 'hinge',
  'deficit-deadlift': 'hinge',
  'barbell-row': 'row',
  'dumbbell-row': 'row-db',
  'cable-row': 'row-cable',
  't-bar-row': 'row',
  'machine-row': 'row-machine',
  'chest-supported-row': 'row-machine',
  'wide-grip-lat-pulldown': 'pulldown',
  'close-grip-lat-pulldown': 'pulldown',
  'reverse-grip-lat-pulldown': 'pulldown',
  'neutral-grip-lat-pulldown': 'pulldown',
  'pull-up': 'pullup',
  'chin-up': 'pullup',
  'assisted-pull-up': 'pullup',
  'straight-arm-pulldown': 'pulldown',
  'good-morning': 'hinge',
  'hyperextension': 'hyperextension',
  'rack-pull': 'hinge',
  'meadows-row': 'row',
  'barbell-overhead-press': 'overhead-press',
  'dumbbell-overhead-press': 'overhead-press-db',
  'machine-overhead-press': 'overhead-press-machine',
  'smith-machine-overhead-press': 'overhead-press-smith',
  'arnold-press': 'overhead-press-db',
  'seated-dumbbell-press': 'overhead-press-db',
  'dumbbell-lateral-raise': 'lateral-raise',
  'cable-lateral-raise': 'lateral-raise-cable',
  'machine-lateral-raise': 'lateral-raise-machine',
  'dumbbell-front-raise': 'front-raise',
  'cable-front-raise': 'front-raise-cable',
  'machine-front-raise': 'front-raise-machine',
  'dumbbell-rear-delt-fly': 'fly-db',
  'cable-rear-delt-fly': 'fly',
  'machine-rear-delt-fly': 'fly',
  'face-pull': 'rear-delt-fly-cable',
  'upright-row': 'upright-row',
  'cable-upright-row': 'upright-row-cable',
  'barbell-shrug': 'shrug',
  'dumbbell-shrug': 'shrug-db',
  'cable-shrug': 'shrug-cable',
  'pike-push-up': 'pushup',
  'barbell-curl': 'curl',
  'ez-bar-curl': 'curl-ezbar',
  'dumbbell-curl': 'curl-db',
  'cable-curl': 'curl-cable',
  'hammer-curl': 'curl-db',
  'preacher-curl': 'curl',
  'preacher-curl-machine': 'curl-machine',
  'concentration-curl': 'curl-db',
  'incline-dumbbell-curl': 'curl-db',
  'spider-curl': 'curl-ezbar',
  'cable-rope-hammer-curl': 'curl-cable',
  '21s-bicep-curl': 'curl',
  'triceps-pushdown-rope': 'pushdown',
  'triceps-pushdown-v-bar': 'pushdown',
  'triceps-pushdown-straight-bar': 'pushdown',
  'overhead-triceps-extension': 'triceps-ext-overhead',
  'cable-overhead-triceps-extension': 'triceps-ext-overhead',
  'skull-crusher': 'triceps-ext-barbell',
  'ez-bar-skull-crusher': 'triceps-ext-barbell',
  'close-grip-bench-press': 'lying-press',
  'triceps-kickback': 'kickback-triceps',
  'triceps-dip': 'dip',
  'bench-dip': 'dip',
  'jm-press': 'triceps-ext-barbell',
  'back-squat': 'squat',
  'front-squat': 'squat',
  'goblet-squat': 'squat-db',
  'hack-squat': 'squat-machine',
  'zercher-squat': 'squat',
  'box-squat': 'squat',
  'bulgarian-split-squat': 'squat-db',
  'pistol-squat': 'squat-bodyweight',
  'leg-press': 'leg-press',
  'walking-lunge': 'lunge',
  'reverse-lunge': 'lunge',
  'lateral-lunge': 'lunge',
  'curtsy-lunge': 'lunge',
  'dumbbell-romanian-deadlift': 'hinge-db',
  'leg-curl-lying': 'leg-curl',
  'leg-curl-seated': 'leg-curl',
  'leg-extension': 'leg-extension',
  'hip-thrust': 'hip-thrust',
  'glute-bridge': 'hip-thrust-bw',
  'cable-kickback': 'kickback-glute',
  'hip-abduction-machine': 'hip-machine',
  'hip-adduction-machine': 'hip-machine',
  'sissy-squat': 'sissy-squat',
  'step-up': 'step-up',
  'standing-calf-raise': 'calf-raise',
  'seated-calf-raise': 'calf-raise',
  'donkey-calf-raise': 'calf-raise',
  'single-leg-calf-raise': 'calf-raise',
  'crunch': 'crunch',
  'bicycle-crunch': 'crunch',
  'reverse-crunch': 'crunch',
  'cable-crunch': 'crunch-cable',
  'hanging-leg-raise': 'leg-raise',
  'hanging-knee-raise': 'leg-raise',
  'lying-leg-raise': 'leg-raise',
  'plank': 'plank',
  'side-plank': 'plank',
  'russian-twist': 'rotate',
  'ab-wheel-rollout': 'ab-wheel',
  'mountain-climber': 'plank',
  'woodchopper-cable': 'rotate-cable',
  'v-up': 'crunch',
  'dead-bug': 'crunch',
  'toe-touch': 'crunch',
  'wrist-curl': 'forearm-curl',
  'reverse-wrist-curl': 'forearm-curl',
  'farmer-s-carry': 'carry',
  'plate-pinch-hold': 'plate-hold',
  'reverse-curl': 'curl',
  'running': 'cardio-run',
  'walking': 'cardio-run',
  'cycling': 'cardio-machine',
  'rowing-machine': 'cardio-machine',
  'elliptical': 'cardio-machine',
  'stair-climber': 'cardio-machine',
  'jump-rope': 'jump-rope',
  'swimming': 'cardio-run',
  'burpee': 'burpee',
  'kettlebell-swing': 'kb-swing',
  'thruster': 'thruster',
  'clean-and-press': 'clean-press',
  'turkish-get-up': 'getup',
  'cat-cow-stretch': 'stretch',
  'world-s-greatest-stretch': 'stretch',
  'hip-flexor-stretch': 'stretch',
  'shoulder-dislocate-band': 'stretch',
  'foam-rolling-quads': 'foam-roll',
  'foam-rolling-back': 'foam-roll',
}

const MUSCLE_DEFAULT_CATEGORY = {
  Chest: 'lying-press', Back: 'row', Shoulders: 'overhead-press', Traps: 'shrug',
  Biceps: 'curl', Triceps: 'pushdown', Legs: 'squat', Glutes: 'hip-thrust',
  Hamstrings: 'hinge', Calves: 'calf-raise', Abs: 'crunch', Cardio: 'cardio-run', FullBody: 'burpee',
}

function stepImagePaths(category) {
  return {
    imageUrlStart: `/exercise-images/${category}-start.svg`,
    imageUrlEnd: `/exercise-images/${category}-end.svg`,
  }
}

const GUIDE_BY_CATEGORY = {
  'lying-press': ['Lie flat with your feet planted and shoulder blades set.', 'Lower the weight under control toward the chest.', 'Press upward without bouncing or losing your shoulder position.', 'Finish the rep with controlled elbows and a stable torso.'],
  'lying-press-db': ['Set the bench and brace your feet before lifting the dumbbells.', 'Lower both weights with control until the upper arms are comfortably below parallel.', 'Press the dumbbells up while keeping the wrists stacked.', 'Return to the start without dropping the weights.'],
  'lying-press-machine': ['Adjust the seat so the handles line up with mid-chest.', 'Brace your torso and take the handles with a neutral wrist.', 'Press smoothly until the arms are nearly straight.', 'Control the return and keep the chest engaged.'],
  'lying-press-smith': ['Set the bench and bar so the starting position is stable.', 'Unrack with the wrists stacked and shoulder blades supported.', 'Lower the bar under control toward the chest.', 'Press smoothly and re-rack only after the final rep.'],
  'pushup': ['Start in a strong plank with hands just outside shoulder width.', 'Lower your chest while keeping your body in one line.', 'Press the floor away and keep the elbows controlled.', 'Stop when your form starts to change.'],
  'fly': ['Set a stable stance or bench position and soften the elbows.', 'Open the arms under control until you feel a comfortable chest stretch.', 'Bring the hands together by squeezing the chest.', 'Keep the movement smooth rather than swinging the weights.'],
  'fly-db': ['Set the bench and hold the dumbbells above the chest.', 'Lower the weights in a wide arc with slightly bent elbows.', 'Reverse the arc by squeezing the chest.', 'Keep the shoulder joint comfortable throughout.'],
  'row': ['Brace the torso and keep the spine neutral.', 'Pull the weight toward the lower ribs.', 'Pause briefly while squeezing the upper back.', 'Lower the weight slowly without rounding the back.'],
  'row-db': ['Support the body and keep the working shoulder controlled.', 'Pull the dumbbell toward the hip or lower ribs.', 'Squeeze the back without twisting the torso.', 'Lower to a full comfortable stretch.'],
  'pulldown': ['Set the thigh pad and take a comfortable grip.', 'Pull the bar toward the upper chest while keeping the torso stable.', 'Pause with the shoulder blades moving down and back.', 'Control the bar to the start without shrugging.'],
  'pullup': ['Start from a controlled hang with the shoulders active.', 'Pull the body upward by driving the elbows toward the ribs.', 'Bring the chin over the bar if your range allows.', 'Lower under control instead of dropping.'],
  'hinge': ['Stand with a balanced stance and brace the trunk.', 'Hinge at the hips while keeping the back neutral.', 'Drive the floor away and extend the hips to stand tall.', 'Finish tall without leaning backward.'],
  'hinge-db': ['Hold the dumbbells close to the legs and brace the trunk.', 'Push the hips back while keeping a neutral spine.', 'Drive through the floor and squeeze the glutes to stand.', 'Lower again with the same controlled hinge.'],
  'squat': ['Set the feet in a comfortable stance and brace the trunk.', 'Sit down and back while keeping the knees tracking with the toes.', 'Descend only as far as you can maintain good control.', 'Drive through the feet to stand without collapsing the knees.'],
  'squat-db': ['Hold the load securely and brace before descending.', 'Lower with the knees tracking over the toes.', 'Keep the chest controlled and the weight balanced.', 'Stand by driving through the whole foot.'],
  'squat-machine': ['Adjust the machine so the hips and feet are comfortable.', 'Lower the platform with controlled knee and hip flexion.', 'Use a depth that keeps the pelvis and knees controlled.', 'Press through the platform without locking out aggressively.'],
  'lunge': ['Stand tall with the trunk braced.', 'Step or split into a controlled lunge.', 'Lower until the front leg is comfortably loaded and balanced.', 'Drive through the front foot to return to the start.'],
  'hip-thrust': ['Set the upper back securely and place the feet under the knees.', 'Lower the hips with the ribs controlled.', 'Drive through the feet and squeeze the glutes at the top.', 'Lower slowly without overextending the lower back.'],
  'leg-curl': ['Set the machine so the knee joint lines up with the pivot.', 'Curl the pad toward the body without lifting the hips.', 'Squeeze the hamstrings briefly.', 'Return the weight slowly to the start.'],
  'leg-extension': ['Adjust the pad so it rests comfortably above the ankles.', 'Extend the knees smoothly without swinging.', 'Pause briefly near the top.', 'Lower the pad under control.'],
  'calf-raise': ['Stand securely with the feet balanced on the platform.', 'Lower the heels through a comfortable range.', 'Drive through the balls of the feet and raise the heels.', 'Pause at the top and lower slowly.'],
  'curl': ['Keep the elbows close to the torso and brace the body.', 'Curl the weight without swinging the shoulders.', 'Squeeze the biceps near the top.', 'Lower slowly to the starting position.'],
  'curl-db': ['Keep the wrists neutral and elbows controlled.', 'Curl the dumbbells through a comfortable range.', 'Squeeze the biceps without moving the upper arms.', 'Lower slowly and repeat.'],
  'pushdown': ['Set the cable and brace the torso.', 'Keep the elbows close while extending the arms.', 'Squeeze the triceps at full comfortable extension.', 'Return the handle slowly without letting the shoulders roll forward.'],
  'triceps-ext-overhead': ['Brace the trunk and keep the elbows pointed forward.', 'Lower the weight behind the head with control.', 'Extend the elbows to bring the weight back up.', 'Keep the upper arms stable throughout.'],
  'lateral-raise': ['Stand tall with a slight bend in the elbows.', 'Raise the arms out to the sides under control.', 'Stop around shoulder height or a comfortable range.', 'Lower slowly without swinging.'],
  'overhead-press': ['Brace the trunk and start with the weight at shoulder level.', 'Press overhead while keeping the ribs controlled.', 'Finish with the weight balanced over the shoulders.', 'Lower under control.'],
  'overhead-press-db': ['Set the dumbbells at shoulder height and brace.', 'Press both weights upward without leaning back.', 'Finish with the arms controlled overhead.', 'Lower the dumbbells to the shoulders slowly.'],
  'crunch': ['Brace the trunk and keep the neck relaxed.', 'Curl the ribcage toward the pelvis using the abs.', 'Pause briefly at the top.', 'Lower slowly without pulling on the neck.'],
  'generic': ['Set up in a stable position and brace your body.', 'Move through a comfortable range with control.', 'Keep the target muscle engaged and avoid momentum.', 'Stop the set when technique starts to break down.']
}

function withStepImages(list) {
  // Only ship exercises that have a dedicated start/finish demonstration.
  // Never show a generic letter/placeholder image for a real exercise.
  return list.map(e => {
    const category = SLUG_STEP_CATEGORY[e.slug]
    if (!category) return null
    const instructions = Array.isArray(e.instructions) && e.instructions.length ? e.instructions : (GUIDE_BY_CATEGORY[category] || GUIDE_BY_CATEGORY.generic)
    const safetyTips = Array.isArray(e.safetyTips) && e.safetyTips.length ? e.safetyTips : [
      'Use a load you can control for the full target range.',
      'Keep the movement smooth and stop if sharp pain occurs.',
      'Prioritize technique before adding weight.'
    ]
    return { ...e, instructions, safetyTips, ...stepImagePaths(category) }
  }).filter(Boolean)
}

export const exerciseLibrary = withStepImages(combinedExercises)
export const exercises = exerciseLibrary
export const exerciseCount = exerciseLibrary.length
export const muscleGroups = [...new Set(exercises.map(e => e.primaryMuscle))]
export const equipmentTypes = [...new Set(exercises.map(e => e.equipment))]
