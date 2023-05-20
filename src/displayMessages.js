export const welcomeMessages = [
    [
        `Welcome!`, 
        [
        `This vertex coloring visualizer four-colors complex planar graphs with a series of 
            selectable heuristics. These heuristics are all based on the paper linked at
            the top left of this message.`,
        `For the sake of simplicity and visual clarity, this visualizer can only
            generate plane graphs, but these heuristics work for any planar graph.`,
        ],
        ['#paper-link']
    ],
    [
        `Limitations`,
        [
        `These graphs can only have straight edges. This may seem like a large limitation, but 
            Fáry's theorem proves that any planar graph can be embedded in the plane with straight
            edges.`,
        `Also, the heuristics don't abuse the plane embedding—they just know they're
            operating on a planar graph.`,
        `Note that, for now, the navbars are built for 15'' 1920x1080 displays and will look the
            best on those. You might need to zoom in or out a little and reload for the best
            experience.`,
        `Now let's get into the controls!`
        ],
        []
    ],
    [
        `Basic Controls`,
        [
        `Click on an empty space in the grid to create a node. To create an edge, click on one node,
            drag to another node, and release. You can also delete edges by clicking on them!`,
        `Now let's run through the instructions at the top so you can get coloring!`
        ],
        []
    ],
    [
        `Non-planar vs Planar`,
        [
        `By default, this visualizer will only generate plane graphs. For some extra fun,
            though, you can disable these checks, and it allows the nodes to move around.
            The visualizer won't color these graphs, but feel free to play around with them!`,
        ],
        [`#planar-button`]
    ],
    [
        `Add nodes`,
        [
        `Click this button once to begin automatically adding nodes. Until clicked again, this button
            will repeatedly look for space to add nodes and add them where possible. This allows for
            significantly more complex graphs to be generated with a lot less work.`
        ],
        ['#add-nodes-button']
    ],
    [
        `Connect`,
        [
        `Click this button to randomly connect existing nodes. This may not be a perfect
            triangulation, since there are checks in place to keep the graph looking clean, but
            it will still generate a decently dense graph.`,
        `It's recommended that you first add lots of nodes, then stop adding them, and then
            connect the graph (this will help generate the densest graph possible).`
        ],
        ['#triangulate-button']
    ],
    [
        `Clear`,
        [
        `This button clears all nodes and edges.`
        ],
        ['#clear-button']
    ],
    [
        `Color`,
        [
        `This button will lead you to the coloring interface! Click this once you've
            generated a graph and want to start coloring it!`
        ],
        ['#color-button']
    ],
    [
        `Console`,
        [
            `If you're feeling a little lost, don't forget to look up at the console (top right) for
                some clarification!`
        ],
        ['#console']
    ]
];

export const tutorialMessages = [
    [
        `Welcome to the Coloring Menu!`,
        [
            `This visualizer uses a reasonably complex heuristic layering mechanism, so let's
                clear things up with a quick tutorial and explain the heuristics we'll be using.`
        ],
        []
    ],
    [
        `Basic Coloring`, 
        [
            `Our basic strategy is to pick an uncolored vertex, look at the colors of its neighbors,
                and assign it a random color, out of our four valid colors, that none of them are
                using.`,
            `That's just basic vertex coloring, but now we're left with two questions: First, which
                vertex do we pick? Second, what do we do when there's no color left for a vertex?
                Well, both of those problems are solved (quickly) by heuristics!`
        ],
        []
    ],
    [
        `Ordering Heuristics`,
        [
            `Let's address that first question: which vertex do we pick?`,
            `Although we could just randomly pick vertices, we can make things a lot better for
                ourselves with an ordering heuristic. This is controlled by the second button from
                the left, and you're required to select an ordering heuristic to start
                coloring.`,
            `The options are Smallest-Last and Saturation (the placeholder "Ordering..." just
                deselects the heuristic), which will be explained after the rest of the controls.`
        ],
        ['.ordering-heuristic-dropdown']
    ],
    [
        `Resolution Heuristics`,
        [
            `When a vertex is surrounded by all four colors, we have reached an impasse and need to
                employ a resolution heuristic. Your first heuristic is selected by the third
                button from the left, and you're required to select one before coloring.`,
            `The options are Kempe Chaining, Wandering 5th Color, and Localized Deep Backtracking.`,
        ],
        ['.heuristic-dropdown-1']
    ],
    [
        `Heuristic Layering`,
        [
            `Once you select your ordering heuristic and first resolution heuristic, you may notice
                another button has popped up. This is for selecting your second resolution heuristic
                out of the same three options (but you can't pick the same option twice).`,
            `Although the heuristics are robust, different heuristics are good for different
                impasses. For this reason, they each have a parameter that configures them to stop
                and fail at some point (at which point it's decided that they weren't good for
                the impasse). Once they fail, the algorithm will move onto the next heuristic.`,
            `If all heuristics fail, the entire coloring will be restarted. The more heuristics
                you select, the more layers you will have to tackle each impasse, and the less
                likely it is that you'll need to restart.`,
            `For example, if you only select Kempe Chaining, then an impasse
                is met and Kempe Chaining fails, the coloring will be restarted. However, if you
                choose Kempe Chaining, Wandering 5th, and Localized Deep Backtracking, then
                all three of those will have to fail on the impasse in order for the coloring
                to be restarted.`,
            `We're almost done! Select some extra heuristics (up to three total) if you'd like!`
        ],
        ['.heuristic-dropdown-2, .heuristic-dropdown-3']
    ],
    [
        `Let's Color!`,
        [
            `That's all for the controls! The next few pages of this overlay will explain the
                heuristics and their parameters, but if you just want to see some coloring,
                go ahead and close this message and press play now!`
        ],
        ['#coloring-play-button']
    ],
    [
        `Ordering: Smallest-Last`,
        [
            `Let's start with ordering heuristics. Smallest-Last prunes low-degree vertices from
                the graph, inductively removing the min-degree vertex at every step, and processes
                the vertices in reverse order.`,
            `Since every planar graph has at least one vertex with degree at most 5 and removing 
                vertices keeps the graph planar, every vertex processed will have degree at
                most 5.`,
            `Here, Smallest-Last ordering has been implemented using a heap and a stack.`
        ],
        []
    ],
    [
        `Ordering: Saturation`,
        [
            `Saturation ordering processes vertices based on how many colored neighbors they have.
                At every step, the vertex with the most colored neighbors is colored. Ties are
                broken by coloring the vertex with the most uncolored neighbors. This is the same
                ordering mechanism as DSatur.`,
            `Here, Saturation ordering has been implemented using a heap.`
        ],
        []
    ],
    [
        `Resolution: Kempe Chaining`,
        [
            `Now let's move onto impasse resolution heuristics. First up is Kempe chaining. Kempe
                chaining randomly picks a colored neighbor of the impasse vertex. Then, for every
                other color, it does a depth-first search of the graph, starting at the
                selected neighbor and only traversing vertices of these two colors.`,
            `The search swaps the colors of visited vertices at every step (between the two 
                colors), hoping to free up a color for the impasse vertex. Kempe chaining fails
                when no color has been freed up after a certain number of searches, determined
                by its parameter.`,
            `This parameter has been set to 5 for this visualizer so that Kempe chaining will fail
                every so often and show off the heuristic layering.`
        ],
        []
    ],
    [
        `Resolution: Wandering 5th Color`,
        [
            `Next, we have Wandering 5th Color. Wandering 5th Color starts at the impasse vertex
                and assigns it a 5th color. This 5th color then recursively "wanders" to uniquely
                colored neighbors, swapping colors with them, and attempts to resolve the impasse
                there.`,
            `Wandering 5th Color fails when it has visited any particular vertex more than T times,
                where T is the heuristic's parameter. In this case, it has been set to 2.`
        ],
        []
    ],
    [
        `Resolution: LDBT`,
        [
            `Localized Deep Backtracking (LDBT) is the most complex of the resolution heuristics.
                First, it does a breadth-first search of the colored vertices around the impasse
                vertex. It stops after it reaches L vertices, which is one of the parameters to
                this heuristic. L is set to 17 here.`,
            `Next, visualize the coloring of this neighboorhood as the leftmost branch of the enumeration
                tree for all of its possible colorings. Localized Deep Backtracking traverses the
                leaf level of this "tree" until it finds a valid coloring or has recolored B 
                vertices (at which point it fails), the other parameter to this heuristic.
                B is set to 200 here.`,
            `Crucially, though, this enumeration tree must be set up such that its branches are in reverse
                breadth-first search order. That is, recolor nodes that are closer to the impasse
                vertex first.`
        ],
        []
    ],
    [
        `Thank You!`,
        [
            `Thanks for reading through all of this information! I know it was a lot...`,
            `Feel free to check out the paper if you'd like to know more about any of these
            heuristics. Happy coloring!!!`
        ],
        ['#paper-link']
    ]
];