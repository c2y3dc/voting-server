import { List, Map } from 'immutable'
import { expect } from 'chai'

import { setEntries, next, restart, vote } from '../src/core'

describe('application logic', () => {

	describe('setEntries', () => {
		it('adds the entries to the state', () => {
			const state = Map()
			const entries = List.of('Trainspotting', '28 Days Later')
			const nextState = setEntries(state, entries)
			expect(nextState).to.equal(Map({
				entries: List.of('Trainspotting', '28 Days Later'),
				initialEntries: List.of('Trainspotting', '28 Days Later')
			}))
		})
		it('converts to immutable', () => {
			const state = Map()
			const entries = ['Trainspotting', '28 Days Later']
			const nextState = setEntries(state, entries)
			expect(nextState).to.equal(Map({
				entries: List.of('Trainspotting', '28 Days Later'),
				initialEntries: List.of('Trainspotting', '28 Days Later')				
			}))
		})
	})

	describe('next', () => {
		it('takes the next two entries under vote', () => {
			const state = Map({
				entries: List.of('Trainspotting', '28 Days Later', 'Sunshine')
			})
			const nextState = next(state)

			expect(nextState).to.equal(Map({
				vote: Map({
					round: 1,
					pair: List.of('Trainspotting', '28 Days Later')
				}),
				entries: List.of('Sunshine')
			}))
		})
		it('puts winner of current vote back to entries', () => {
			const state = Map({
				vote: Map({
					round: 1,
					pair: List.of('Trainspotting', '28 Days Later'),
					tally: Map({
						'Trainspotting': 4,
						'28 Days Later': 2
					})
				}),
				entries: List.of('Sunshine', 'Millions', '127 Hours')
			})
			const nextState = next(state)
			expect(nextState).to.equal(Map({
				vote: Map({
					round: 2,
					pair: List.of('Sunshine', 'Millions')
				}),
				entries: List.of('127 Hours', 'Trainspotting')
			}))
		})
		it('puts both from tied vote back to entries', () => {
			const state = Map({
				vote: Map({
					round: 1,
					pair: List.of('Trainspotting', '28 Days Later'),
					tally: Map({
						'Trainspotting': 3,
						'28 Days Later': 3
					})
				}),
				entries: List.of('Sunshine', 'Millions', '127 Hours')
			})
			const nextState = next(state)
			expect(nextState).to.equal(Map({
				vote: Map({
					round: 2,
					pair: List.of('Sunshine', 'Millions')
				}),
				entries: List.of('127 Hours', 'Trainspotting', '28 Days Later')
			}))
		})
		it('marks winner with just entry left', () => {
			const state = Map({
				vote: Map({
					round: 1,
					pair: List.of('Trainspotting', '28 Days Later'),
					tally: Map({
						'Trainspotting': 4,
						'28 Days Later': 2
					})
				}),
				entries: List()
			})
			const nextState = next(state)
			expect(nextState).to.equal(Map({
				winner: 'Trainspotting'
			}))
		})
	})

	describe('restart', () => {
		it('returns to initial entries and takes the first two entries under vote', () => {
			const state = Map({
				vote: Map({
					round: 1,
					pair: List.of('Trainspotting', 'Sunshine')
				}),
				entries: List(),
				initialEntries: List.of('Trainspotting', '28 Days Later', 'Sunshine')
			})
			const nextState = restart(state)
			expect(nextState).to.equal(Map({
				vote: Map({
					round: 2,
					pair: List.of('Trainspotting', '28 Days Later')
				}),
				entries: List.of('Sunshine'),
				initialEntries: List.of('Trainspotting', '28 Days Later', 'Sunshine')
			}))
		})
	})

	describe('vote', () => {
		it('creates a tally for voted entry', () => {
			const state = Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later')
			})
			const nextState = vote(state, 'Trainspotting', 'voter1')
			expect(nextState).to.equal(Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
				tally: Map({
					'Trainspotting': 1
				}),
				votes: Map({
					voter1: 'Trainspotting'
				})
			}))
		})

		it('adds to existing tally for the voted entry', () => {
			const state = Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
				tally: Map({
					'Trainspotting': 3,
					'28 Days Later': 2
				}),
				votes: Map()
			})
			const nextState = vote(state, 'Trainspotting', 'voter1')
			expect(nextState).to.equal(Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
				tally: Map({
					'Trainspotting': 4,
					'28 Days Later': 2
				}),
				votes: Map({
					voter1: 'Trainspotting'
				})
			}))
		})

		it('prevents invalid votes', () => {
			const state = Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
			})
			const nextState = vote(state, 'Dawn of the Dead')
			expect(nextState).to.equal(Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later')
			}))
		})

		it('nullifies previous vote for the same voter', () => {
			const state = Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
				tally: Map({
					'Trainspotting': 3,
					'28 Days Later': 2
				}),
				votes: Map({
					voter1: '28 Days Later'
				})
			})
			const nextState = vote(state, 'Trainspotting', 'voter1')
			expect(nextState).to.equal(Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
				tally: Map({
					'Trainspotting': 4,
					'28 Days Later': 1
				}),
				votes: Map({
					voter1: 'Trainspotting'
				})
			}))
		})
	})
})