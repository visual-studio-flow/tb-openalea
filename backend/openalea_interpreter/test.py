import k3d
from openalea.mtg import MTG, fat_mtg
from openalea.weberpenn.mtg_client import Weber_MTG
from openalea.weberpenn.tree_client import Quaking_Aspen
from oawidgets.plantgl import PlantGL, group_meshes_by_color


def default_mtg():
    g = MTG()
    root = g.add_component(g.root)

    axis0 = [0, 0, 2, 4, 1, 0, 1, 0]
    axis1 = [1, 0, 2, 0]
    axis2 = [0, 0]

    def add_axis(vid, axis):
        stack = []
        for nb_ramif in axis:
            for i in range(nb_ramif):
                v = g.add_child(vid, edge_type="+")
                stack.append(v)
            vid = g.add_child(vid, edge_type="<")
        return stack

    order1 = add_axis(root, axis0)
    order2 = []
    for vid in order1:
        order2.extend(add_axis(vid, axis1))
    for vid in order2:
        add_axis(vid, axis2)

    fat_mtg(g)

    return g


g = default_mtg()
param = Quaking_Aspen()
wp = Weber_MTG(param, g)
wp.run()

plot = wp.plot()
print(plot)
# PlantGL(wp.plot())
meshes = group_meshes_by_color(plot, side="front")
for mesh in meshes:
    print(mesh)
    indexes = [int(i) for sublist in mesh.indices for i in sublist]
    vertexes = [float(v) for sublist in mesh.vertices for v in sublist]
    print(len(indexes), len(vertexes))
