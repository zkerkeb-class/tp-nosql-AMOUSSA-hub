const team = await Team.findById(req.params.id)
            .populate({
                path: 'pokemons',
                model: 'Pokemon',
                localField: 'pokemons',
                foreignField: 'id'
            })
            .populate('user', 'username');