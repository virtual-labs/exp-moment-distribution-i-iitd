### Theory

The Moment Distribution Method is a structural analysis technique used to determine the internal moments rotations of joints in statically indeterminate beams and frames, by iteratively adjusting the moments among the joints of a structure until all joints are balanced. This is done by locking joints that aren't already fixed against rotation, balancing the joint, and then distributing the balancing moment among the members that meet at the joint.

#### Assumption
We shall restrict our selves to beams &frames made up of prismatic members only. Plane frames & beams only.
#### Sign convection 
Anti clockwise moment / rotation +ve

#### 1. Static Indeterminacy
A structure is statically indeterminate if the number of unknown forces (reactions and internal forces) exceeds the number of available equilibrium equations. In such cases, additional equations are needed based on the structure's geometry and deformation characteristics (i.e., compatibility of deformations). Indeterminate beams and frames often arise in practical structures like multi-span bridges and buildings with rigid joints.

#### 2. Stiffness:
The stiffness of a structural member is a measure of its resistance to rotation under the action of moments. It plays a central role in determining how moments are distributed across different members connected at a joint. For a beam of length L, modulus of elasticity E, and moment of inertia I, the stiffness K is defined as the moment required to cause a unit rotation at one end of the member while the other end is held fixed:

##### K = 4EI/L (for a member with both ends fixed)
##### K = 3EI / L (for a member fixed at one end and pinned at the other)

#### 3. Fixed-End Moments (FEM)
When a beam or frame member is subjected to external loads and the ends of the member are restrained (fixed), moments develop at the ends. These are known as fixed-end moments. They are essential in the moment distribution method as they represent the initial unbalanced moments at the joints. For example, for a beam of length L carrying a uniformly distributed load w, the fixed-end moments at the two ends of the beam are given by:

#### FEM<sub>AB</sub> = -(wL<sup>2</sup> /12), FEM<sub>BA</sub> = wL<sup>2</sup>/12

Where (FEM<sub>AB</sub>) is the moment at end A of member AB, and FEMBA is the moment at end B.

#### 4. Distribution Factor (DF)
At each joint, the total moment to be distributed is shared among the connected members based on their relative stiffnesses. This ratio is known as the distribution factor. It ensures that stiffer members take a larger share of the moment. The distribution factor for a member connected at a joint is calculated as

DF = K <sub>member</sub> / K <sub>all members at the joint</sub>

Where Kmember is the stiffness of the individual member, and the denominator is the sum of stiffnesses of all members connected to the joint.

### 5. Carry-Over Factor (COF)
When a moment is applied at one end of a member, part of this moment is transferred, or "carried over," to the other end of the member. This is known as the carry-over factor.
The carry-over factor for most beams is 0.5, meaning that if a moment is applied at one end of a member, a moment of 0.5Mwill be carried over to the other end.
