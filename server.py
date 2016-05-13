import psycopg2
import json
from flask import Flask, request, send_from_directory
from config import conn


tables = {'gas': {'arcs': 'gas_arcs', 'nodes':'gas_arcs_vertices_pgr', 'conn': 'gas_cust', 'station_id':259},
'heating': {'arcs':'heat_arcs', 'nodes': 'heat_arcs_vertices_pgr', 'conn': 'heat_cust', 'station_id': 2},
'water': {'arcs': 'vatten_arc', 'nodes':'vatten_arc_vertices_pgr', 'conn': 'vatten_cust', 'station_id':1394}}

app = Flask(__name__)
@app.route('/conn/<filename>')
def custGetter(filename):
    
    with conn.cursor() as cursor:
        #custCurs = conn.cursor()
        query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid, cust_id) as l )) as properties FROM {0} as lg ) as f ) as fc;".format(filename)
        cursor.execute(query)
        inVar = (cursor.fetchone()[0])
    return json.dumps(inVar)

@app.route('/arc/<filename>')
def arcGetter(filename):
    
    with conn.cursor() as cursor:
        #arcCurs = conn.cursor()
        query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM {0} as lg ) as f ) as fc;".format(filename)
        cursor.execute(query)
        inVar = (cursor.fetchone()[0])
    return json.dumps(inVar)

@app.route('/node/<filename>')
def nodeGetter(filename):
    with conn.cursor() as cursor:
        #nodeCurs = conn.cursor()
        query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM {0} as lg ) as f ) as fc;".format(filename)
        cursor.execute(query)
        inVar = (cursor.fetchone()[0])
    return json.dumps(inVar)

@app.route('/menu/cust/<custList>')
def menuCustomers(custList):
    with conn.cursor() as cursor:    
        #menuCurs = conn.cursor()
        query = "SELECT row_to_json(fc) FROM (SELECT firstname, lastname, address, gid FROM customers) fc WHERE fc.gid IN {0};".format(str(custList))
        cursor.execute(query)
        inVar = [w[0] for w in cursor.fetchall()]
    return json.dumps(inVar)

@app.route('/heatmap')
def heatmapMaker():
    with conn.cursor() as cursor:
        #heatCurs = conn.cursor()
        query = "select gid from vatten_cust order by random() limit 50;"
        cursor.execute(query)
        gid_list = [w[0] for w in cursor.fetchall()]
        gid_list.extend([90, 114, 109, 108, 93, 87, 78, 84, 99, 102, 105, 96, 120, 117, 72, 64, 69, 81, 75])
        gid_list.extend([1188, 1200, 1218, 1215, 1221, 1194, 1191, 1203, 975, 1212, 1185, 1197, 1209, 1206])
        gid_list.extend([631, 634, 637, 640, 643, 646, 649, 654])
        query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid, cust_id) as l )) as properties FROM vatten_cust as lg WHERE gid in {0}) as f ) as fc".format(str(gid_list).replace('[','(').replace(']',')'))
        cursor.execute(query)
        inVar = [w[0] for w in cursor.fetchall()]
    return json.dumps(inVar[0])


@app.route('/repairs')
def repairMaker():
    with conn.cursor() as cursor:
        #cursor = conn.cursor()
        query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM repairjobs as lg) as f ) as fc"
        cursor.execute(query)
        inVar = [w[0] for w in cursor.fetchall()]
    return json.dumps(inVar[0])

@app.route('/installations')
def installMaker():
    with conn.cursor() as cursor:
        installCurs = conn.cursor()    
        query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM installationjobs as lg) as f ) as fc"
        installCurs.execute(query)
        inVar = [w[0] for w in installCurs.fetchall()]
    return json.dumps(inVar[0])



@app.route('/broken/<network_name>/<node_id>')
def nodeBreaker(network_name, node_id):
    with conn.cursor() as cursor:
        arc_tbl = "\'"+tables[network_name]['arcs']+"\'"
        node_tbl = "\'"+tables[network_name]['nodes']+"\'"
        conn_tbl = "\'"+tables[network_name]['conn']+"\'"
        #brokenCurs = conn.cursor()
        query = "SELECT * FROM nodeMaker({0}, {1}, {2}) WHERE nodemaker IS NOT NULL".format(node_id, arc_tbl, tables[network_name]['station_id'])
        try:
            cursor.execute(query)
            brokenNodes = [w[0][0] for w in cursor.fetchall()]
            nodeSet = set()
            for i in brokenNodes:
                nodeSet = nodeSet.union(bfs(arc_tbl,int(node_id), i))
            if nodeSet:
                return json.dumps({'Arc':json.loads(getBrokenArc(arc_tbl, nodeSet)),'Node':json.loads(getBrokenNode(node_tbl, node_id)),'Conn':json.loads(getBrokenCust(conn_tbl, nodeSet))})
            else:
                return "NULL" 
        except:
            conn.rollback()
            print(query)
            return "NULL"
       

def bfs(network_name,broken_node, node_id):
    with conn.cursor() as cursor:
        #bfsCurs = conn.cursor()
        visited, queue = set([broken_node]), [node_id]
        while queue:
            vertex = queue.pop(0)
            if vertex not in visited:
                query = "SELECT * FROM neighbornodes({0}, {1})".format(vertex, network_name) ##Fix dynamic network
                cursor.execute(query)
                node_set = set([w[0] for w in cursor.fetchall()])
                visited.add(vertex)
                queue.extend(node_set - visited)
    return visited

def getBrokenArc(network_name,nodeSet):
    with conn.cursor() as cursor:
        #baCurs = conn.cursor()
        query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM {0} as lg WHERE source in {1} AND target in {1}) as f ) as fc;".format(network_name.strip("\'"), str(nodeSet).replace('{','(').replace('}',')'))
        cursor.execute(query)
        inVar = (cursor.fetchone()[0])
    return json.dumps(inVar)    
    #Gets arcs with source/target in bfs-set



def getBrokenNode(network_name,brokenNode):
    with conn.cursor() as cursor:
        #bnCurs = conn.cursor()
        query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid) as l )) as properties FROM {0} as lg WHERE gid = {1} ) as f ) as fc;".format(network_name.strip("\'"), brokenNode)
        cursor.execute(query)
        inVar = (cursor.fetchone()[0])
    return json.dumps(inVar) 
    #gets nodes intersecting bfs-set

def getBrokenCust(network_name,nodeSet):
    with conn.cursor() as cursor:
        #cursor = conn.cursor()
        query = "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) as features FROM (SELECT 'Feature' as type, ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT dp_otype, dp_ctype, dp_subtype, gid, cust_id) as l )) as properties FROM {0} as lg WHERE gid in {1}) as f ) as fc;".format(network_name.strip("\'"), str(nodeSet).replace('{','(').replace('}',')'))
        cursor.execute(query)
        inVar = (cursor.fetchone()[0])
    return json.dumps(inVar) 
    #gets customers intersecting bfs-set

if __name__ == "__main__":
    app.debug = True
    app.run(host='127.0.0.1', port=5000)
