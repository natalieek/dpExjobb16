import psycopg2
import json
from flask import Flask, request, send_from_directory
from config import conn

tables = {'gas': {'arcs': 'gas_arcs', 'nodes':'gas_arcs_vertices_pgr', 'cust': 'gas_cust', 'station_id':539},
'heating': {'arcs':'heat_arcs', 'nodes': 'heat_arcs_vertices_pgr', 'cust': 'heat_cust', 'station_id': 2},
'water': {'arcs': 'vatten_arc', 'nodes':'vatten_arc_vertices_pgr', 'cust': 'vatten_cust', 'station_id':1394}}

app = Flask(__name__)
@app.route('/cust/<filename>')
def custGetter(filename):
    custCurs = conn.cursor()
    query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid, cust_id) as l )) as properties FROM {0} as lg ) as f ) as fc;".format(filename)
    custCurs.execute(query)
    inVar = (custCurs.fetchone()[0])
    return json.dumps(inVar)

@app.route('/arc/<filename>')
def arcGetter(filename):
    arcCurs = conn.cursor()
    query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM {0} as lg ) as f ) as fc;".format(filename)
    arcCurs.execute(query)
    inVar = (arcCurs.fetchone()[0])
    return json.dumps(inVar)

@app.route('/node/<filename>')
def nodeGetter(filename):
    nodeCurs = conn.cursor()
    query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM {0} as lg ) as f ) as fc;".format(filename)
    nodeCurs.execute(query)
    inVar = (nodeCurs.fetchone()[0])
    return json.dumps(inVar)

@app.route('/menu/cust/<custList>')
def menuCustomers(custList):    
    menuCurs = conn.cursor()
    query = "SELECT row_to_json(fc) FROM (SELECT firstname, lastname, address, gid FROM customers) fc WHERE fc.gid IN {0};".format(str(custList))
    print(query)
    menuCurs.execute(query)
    inVar = [w[0] for w in menuCurs.fetchall()]
    return json.dumps(inVar)

@app.route('/heatmap')
def heatmapMaker():
    heatCurs = conn.cursor()
    query = "select gid from vatten_cust order by random() limit 50;"
    heatCurs.execute(query)
    gid_list = [w[0] for w in heatCurs.fetchall()]
    gid_list.extend([90, 114, 109, 108, 93, 87, 78, 84, 99, 102, 105, 96, 120, 117, 72, 64, 69, 81, 75])
    gid_list.extend([1188, 1200, 1218, 1215, 1221, 1194, 1191, 1203, 975, 1212, 1185, 1197, 1209, 1206])
    gid_list.extend([631, 634, 637, 640, 643, 646, 649, 654])
    query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid, cust_id) as l )) as properties FROM vatten_cust as lg WHERE gid in {0}) as f ) as fc".format(str(gid_list).replace('[','(').replace(']',')'))
    heatCurs.execute(query)
    inVar = [w[0] for w in heatCurs.fetchall()]
    return json.dumps(inVar[0])


@app.route('/repairs/')
def repairMaker():
    repairCurs = conn.cursor()
    query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM repairjobs as lg) as f ) as fc"
    repairCurs.execute(query)
    inVar = [w[0] for w in repairCurs.fetchall()]
    return json.dumps(inVar[0])

@app.route('/installations/')
def installMaker():
    installCurs = conn.cursor()    
    query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM installationjobs as lg) as f ) as fc"
    installCurs.execute(query)
    inVar = [w[0] for w in installCurs.fetchall()]
    return json.dumps(inVar[0])



@app.route('/broken/<network_name>/<node_id>')
def nodeBreaker(network_name, node_id):
    arc_tbl = "\'"+tables[network_name]['arcs']+"\'"
    node_tbl = "\'"+tables[network_name]['nodes']+"\'"
    cust_tbl = "\'"+tables[network_name]['cust']+"\'"
    brokenCurs = conn.cursor()
    query = "SELECT * FROM nodeMaker({0}, {1}, {2}) WHERE nodemaker IS NOT NULL".format(node_id, arc_tbl, tables[network_name]['station_id'])
    brokenCurs.execute(query)
    brokenNodes = [w[0][0] for w in brokenCurs.fetchall()]
    nodeSet = set()
    for i in brokenNodes:
        nodeSet = nodeSet.union(bfs(arc_tbl,int(node_id), i))
    if nodeSet:
        return json.dumps({'Arc':json.loads(getBrokenArc(arc_tbl, nodeSet)),'Node':json.loads(getBrokenNode(node_tbl, node_id)),'Cust':json.loads(getBrokenCust(cust_tbl, nodeSet))})
    else:
        return "NULL"    

def bfs(network_name,broken_node, node_id):
    bfsCurs = conn.cursor()
    visited, queue = set([broken_node]), [node_id]
    while queue:
        vertex = queue.pop(0)
        if vertex not in visited:
            query = "SELECT * FROM neighbornodes({0}, {1})".format(vertex, network_name) ##Fix dynamic network
            bfsCurs.execute(query)
            node_set = set([w[0] for w in bfsCurs.fetchall()])
            visited.add(vertex)
            queue.extend(node_set - visited)
    return visited

def getBrokenArc(network_name,nodeSet):
    baCurs = conn.cursor()
    query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM {0} as lg WHERE source in {1} AND target in {1}) as f ) as fc;".format(network_name.strip("\'"), str(nodeSet).replace('{','(').replace('}',')'))
    baCurs.execute(query)
    inVar = (baCurs.fetchone()[0])
    return json.dumps(inVar)    
    #Gets arcs with source/target in bfs-set



def getBrokenNode(network_name,brokenNode):
    bnCurs = conn.cursor()
    query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM {0} as lg WHERE gid = {1} ) as f ) as fc;".format(network_name.strip("\'"), brokenNode)
    bnCurs.execute(query)
    inVar = (bnCurs.fetchone()[0])
    return json.dumps(inVar) 
    #gets nodes intersecting bfs-set

def getBrokenCust(network_name,nodeSet):
    bcCurs = conn.cursor()
    query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid, cust_id) as l )) as properties FROM {0} as lg WHERE gid in {1}) as f ) as fc;".format(network_name.strip("\'"), str(nodeSet).replace('{','(').replace('}',')'))
    bcCurs.execute(query)
    inVar = (bcCurs.fetchone()[0])
    return json.dumps(inVar) 
    #gets customers intersecting bfs-set

if __name__ == "__main__":
    app.debug = True
    app.run(host='127.0.0.1', port=5000)
