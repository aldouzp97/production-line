WIP

Assumptions:
- Assuming nothing other that component A, B and assembled product can be on the belt.
- Order of a "step". The belt moves first and then the workers will act on the slot in front of them.
- When workers are in a pair (facing each other in a single belt space) the worker at the top will have priority. But if they're not doing anything (assembling or don't require the item in front of them) the bottom worker can.
- Each "station" (space allocated along the belt) can either have one or two workers (top and bottom optional).
- Only items that reach the end of the belt and exit are counted. Anything left on the belt after the simulation is finished is not counted.
- Workers can only pick up a component (A or B) that they aren't already holding, workers never pick up an assembled item of the belt. Components can be picked up in any order.
- A worker holding a product must place it before collecting new components, even with a free hand.
- On timing each "step" takes time t. When workers assemble a component at t the worker cannot interact with the belt until t4. If the belt slot is occupied and the worker is holding a product (an assembled item of A + B), the worker must wait until a free slot is in front of them before placing the item.