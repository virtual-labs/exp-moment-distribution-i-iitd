### Procedure

#### Step 1- Compute Fixed-End Moments
Begin by calculating the fixed-end moments for all the members in the structure. These moments are due to external loads acting on the members, assuming that the joints are fully restrained (i.e., no rotation occurs at the joints). These moments are the starting point of the analysis, and they represent the unbalanced moments that will need to be redistributed.
  
#### Step 2- Compute Stiffness and Distribution Factors
Determine the stiffness of each member connected to a joint. For beams, the stiffness is 4EI/L for members with both ends fixed, and 3EI/L for members fixed at one end and hinged at the other. Using these stiffness values, calculate the distribution factors for each member at each joint. The sum of the distribution factors at any joint must be equal to 1.

#### Step 3- Distribute Unbalanced Moments
At each joint, the algebraic sum of the moments (including the fixed-end moments) is calculated. If the sum is not zero, the joint is unbalanced. Distribute the unbalanced moment among the connected
members based on their distribution factors. Each member receives a share of the unbalanced moment proportional to its stiffness.

#### Step 4- Carry Over Moments
After distributing the moments at a joint, carry over part of the distributed moment to the far end of each connected member. Typically, half of the moment is carried over to the other end, based on the carry-over factor (0.5). This carry-over process introduces new moments at the other joints, which may, in turn, cause further unbalanced moments that need to be redistributed.
  
#### Step 5- Repeat the Process
Repeat the process of distributing and carrying over moments until the unbalanced moments at all joints become negligibly small, indicating that equilibrium has been achieved at every joint.

#### Step 6: Final Moments
The final moments at each joint are obtained by summing all the moments applied throughout the iterations, including fixed-end moments, distributed moments, and carry-over moments. These moments are then used to calculate shear forces and bending moments within each member. The moment distribution method is particularly useful in analyzing rigid frames where the connections between members are capable of transmitting moments.
