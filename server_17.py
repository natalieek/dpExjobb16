import psycopg2
import cx_Oracle
import json
import string
from flask import Flask, request, send_from_directory
from config import con

app = Flask(__name__)

@app.route('/node/<table1>/<table2>')
def node(table1,table2):
    #with con.cursor() as cursor:
    cursor = con.cursor()
    query = "SELECT json_arrayagg(json_object('type' IS 'Feature','geometry' IS geojson,'properties' IS json_object('id' is obj_id, 'dp_ctype' IS el.dp_ctype, 'dp_otype' IS el.dp_otype, 'installerad' IS el.install_year, 'anmarkningsgrad' is degree ))returning CLOB) AS tempclob from insp.insp_plan pl join insp.insp insp on pl.dp_oid=insp.parent_oid and pl.dp_otype=insp.parent_otype join insp.insp_obs obs on insp.dp_otype=obs.parent_otype and insp.dp_oid=obs.parent_oid right join {1} el on el.dp_oid=pl.parent_oid and el.dp_otype=pl.parent_otype join {0} s on s.dp_oid=el.dp_oid AND s.dp_otype=el.dp_otype where rownum<2".format(table1,table2)
    cursor.execute(query)
    inVar = (cursor.fetchone()[0])
    invar = '{"type": "FeatureCollection", "features":' + ((str(inVar).replace('"{','{')).replace('}"','}')).replace('\\','') + '}'
    print("success")
    return (json.dumps(invar))

@app.route('/cbl/<table1>/<table2>')
def cbl(table1,table2):
    #print(filename)
    #with con.cursor() as cursor:
    cursor = con.cursor()
    query = "SELECT json_arrayagg(json_object('type' IS 'Feature','geometry' IS geo_json,'properties' IS json_object('id' IS obj_id, 'fack' IS ssp_bay_id, 'installerad' IS install_year ))returning CLOB) AS tempclob FROM m_all_objects WHERE install_year IS NOT NULL and dbms_lob.getlength(geo_json)<3800".format(table1,table2)
    cursor.execute(query)
    inVar = (cursor.fetchone()[0])
    invar = '{"type": "FeatureCollection", "features":' + ((str(inVar).replace('"{','{')).replace('}"','}')).replace('\\','') + '}'

    return (json.dumps(invar))

if __name__ == "__main__":
    app.debug = True
    app.run(host='127.0.0.1', port=5000)
