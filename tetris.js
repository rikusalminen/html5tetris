var blocks = [
    {
        name: "O",
        shapes: [
            [[0,0], [0,-1], [-1,0], [-1,-1]]
            ]
    },
    {
        name: "I",
        shapes: [
            [[-2,0], [-1,0], [0,0], [1,0]],
            [[0,-2], [0,-1], [0,0], [0,1]]
            ]
    },
    {
        name: "S",
        shapes: [
            [[-1,-1], [0,-1], [0,0], [1,0]],
            [[0,1], [0,0], [1,0], [1,-1]]
            ]
    },
    {
        name: "Z",
        shapes: [
            [[-1,0], [0,0], [0,-1], [1,-1]],
            [[1,1], [1,0], [0,0], [0,-1]]
            ]
    },
    {
        name: "L",
        shapes: [
            [[-1,-1], [-1,0], [0,0], [1,0]],
            [[0,1], [0,0], [0,-1], [1,-1]],
            [[-1,0], [0,0], [1,0], [1,1]],
            [[-1,1], [0,1], [0,0], [0,-1]]
            ]
    },
    {
        name: "J",
        shapes: [
            [[-1,0], [0,0], [1,0], [1,-1]],
            [[1,1], [0,1], [0,0], [0,-1]],
            [[-1,1], [-1,0], [0,0], [1,0]],
            [[-1,-1], [0,-1], [0,0], [0,1]]
            ]
    },
    {
        name: "T",
        shapes: [
            [[0,-1], [-1,0], [0,0], [1,0]],
            [[1,0], [0,-1], [0,0], [0,1]],
            [[0,1], [-1,0], [0,0], [1,0]],
            [[-1,0], [0,-1], [0,0], [0,1]]
            ]
    }
    ];

function board_create(rows, cols)
{
    var container = document.createElement("div");
    container.className = "tetris";
    container.id = "tetris";

    for(var i = 0; i < rows; ++i)
    {
        var rowdiv = document.createElement("div");
        rowdiv.id = (rows-i-1);
        rowdiv.className = "row";

        for(var j = 0; j < cols; ++j)
        {
            var cellspan = document.createElement("span");
            cellspan.id = j;
            cellspan.className = "cell";
            cellspan.innerHTML = "&nbsp";

            rowdiv.appendChild(cellspan);
        }

        container.appendChild(rowdiv);
    }

    return container;
}

function make_cells(rows, cols)
{
    var cells = Array(rows);
    for(var row = 0; row < cells.length; ++row)
        cells[row] = Array(cols);
    return cells;
}

function put_block(cells, block, orientation, origin_x, origin_y, draw)
{
    for(var i = 0; i < 4; ++i)
    {
        var row = origin_y + block.shapes[orientation][i][1];
        var col = origin_x + block.shapes[orientation][i][0];

        if(row < cells.length && col < cells[row].length)
            cells[row][col] = draw ? block.name : undefined;
    }
}

function draw_cells(container, cell_blocks)
{
    var rows = container.getElementsByClassName("row");
    for(var i = 0; i < rows.length; ++i)
    {
        var rowdiv = rows[i];
        var row = rowdiv.id;
        var cells = rowdiv.getElementsByClassName("cell");

        for(var j = 0; j < cells.length; ++j)
        {
            var cellspan = cells[j];
            var cell = cellspan.id;

            cellspan.setAttribute("block", (cell_blocks != null ? cell_blocks[row][cell] : null) || "empty");
        }
    }
}

function erase(container)
{
    draw_cells(container, null);
}

function tetris(rows, cols)
{
    this.block = null;
    this.blockPos = [0, 0];
    this.blockOrientation = 0;
    this.nextBlock = null;

    this.cells = make_cells(rows, cols);

    this.draw_block = function(draw)
    {
        put_block(this.cells, this.block, this.blockOrientation, this.blockPos[0], this.blockPos[1], draw);
    };

    this.can_move = function(x, y, spin)
    {
        var orientation = (this.blockOrientation + spin) % this.block.shapes.length;
        for(var i = 0; i < 4; ++i)
        {
            var row = y + this.block.shapes[orientation][i][1];
            var col = x + this.block.shapes[orientation][i][0];

            if(row >= rows) continue;
            if(row < 0 || col < 0 || col >= cols) return false;
            if(this.cells[row][col]) return false;
        }

        return true;
    }

    this.update = function()
    {
        // TODO: this.freeFall ++; // for scoring
        this.down();
    };

    this.removelines = function()
    {
        for(var row = 0; row < rows; ++row)
        {
            var remove = true;
            for(var col = 0; col < cols; ++col)
            {
                if(!this.cells[row][col])
                {
                    remove = false;
                    break;
                }
            }

            if(!remove) continue;

            for(var col = 0; col < cols; ++col)
            {
                for(var dest = row; dest < rows; ++dest)
                    this.cells[dest][col] = (dest + 1 < rows) ? this.cells[dest+1][col] : undefined;
            }

            row--;
        }
    }

    this.new_block = function()
    {
        function random_block() { return blocks[Math.floor(Math.random() * blocks.length)]; }

        if(this.nextBlock == null)
            this.nextBlock = random_block();

        this.block = this.nextBlock;
        this.blockPos = [cols / 2, rows-1];
        this.blockOrientation = 0;
        this.nextBlock = random_block();

        this.removelines();
        this.draw_block(true);
    };

    this.interval = function()
    {
        return 500; // TODO: compute interval based on level
    };

    this.move = function(delta_x)
    {
        this.draw_block(false);
        if(this.can_move(this.blockPos[0] + delta_x, this.blockPos[1], 0))
            this.blockPos[0] += delta_x;
        this.draw_block(true);
    };

    this.down = function()
    {
        this.draw_block(false);
        if(this.can_move(this.blockPos[0], this.blockPos[1]-1, 0)) this.blockPos[1] += -1;
        else
        {
            this.draw_block(true);
            this.new_block();
            return true;
        }

        this.draw_block(true);
        return false;
    };

    this.drop = function()
    {
        while(!this.down());
    };

    this.rotate = function()
    {
        this.draw_block(false);
        if(this.can_move(this.blockPos[0], this.blockPos[1], 1))
            this.blockOrientation = (this.blockOrientation + 1) % this.block.shapes.length;
        this.draw_block(true);
    };
}

function game(rows, cols, container)
{
    this.tetris = new tetris(rows, cols);
    this.intervalId = null;

    var board = board_create(rows, cols);
    container.appendChild(board);

    var game = this;
    this.timestep = function()
    {
        game.tetris.update();
        game.repaint();

    };

    this.start = function()
    {
        this.intervalId = window.setInterval(function() { game.timestep(); }, game.tetris.interval() );
    };

    this.pause = function()
    {
        window.clearInterval(this.intervalId);
    };

    this.repaint = function()
    {
        draw_cells(container, this.tetris.cells);
    }

    this.onkeypress = function(ev)
    {
        if(ev.keyIdentifier == "Enter") game.start();
    };

    this.onkeydown = function(ev)
    {
        if(ev.keyIdentifier == "Up") game.tetris.rotate();
        else if(ev.keyIdentifier == "Down") game.tetris.down();
        else if(ev.keyIdentifier == "Left") game.tetris.move(-1);
        else if(ev.keyIdentifier == "Right") game.tetris.move(1);
        else if(ev.keyIdentifier == "U+0020") game.tetris.drop();
        else return;

        game.repaint();
    };
}

function tetris_init()
{
    var container = document.body.children["tetris"];
    var rows = 20, cols = 10;

    var g = new game(rows, cols, container);
    g.tetris.new_block();
    g.repaint();

    document.body.onkeydown = function(ev) { g.onkeydown(ev); }
    document.body.onkeypress = function(ev) { g.onkeypress(ev); }
}
