#import psycopg2
import cx_Oracle
import json
import string
from flask import Flask, request, send_from_directory
from config import con

app = Flask(__name__)

@app.route('/cbl/')
def cbl():
    #print(filename)
    #with con.cursor() as cursor:
    cursor = con.cursor()
    query = "SELECT json_arrayagg(json_object('type' IS 'Feature','geometry' IS geo_json,'properties' IS json_object('obj_oid' is dp_oid, 'obj_otype' is dp_otype,  'fack_oid' IS ssp_bay_oid, 'fack_otype' is ssp_bay_otype, 'installerad' IS install_year, 'bes_grad' IS grad))returning CLOB) AS tempclob FROM all_objects_final WHERE install_year IS NOT NULL and dbms_lob.getlength(geo_json)<3800".format()
    cursor.execute(query)
    inVar = (cursor.fetchone()[0])
    invar = '{"type": "FeatureCollection", "features":' + ((str(inVar).replace('"{','{')).replace('}"','}')).replace('\\','') + '}'

    return (json.dumps(invar))

@app.route('/bay_stats/')
def bay_stats():
    cursor = con.cursor()
    query = "SELECT json_arrayagg(json_object('fack_oid' IS ssp_bay_oid, 'fack_otype' is ssp_bay_otype, 'ant_obj_over_35' IS antal_over_35, 'antal_anm' is antal_bes, 'anm_grad' is bes_grad, 'antal_avbr' is antal_avbr, 'kundtid' is kundtid, 'totval' is null)returning clob) AS tempclob FROM final_bay_stats".format()
    cursor.execute(query)
    inVar = (cursor.fetchone()[0])

    return (json.dumps(inVar.read()))
    

if __name__ == "__main__":
    app.debug = True
    app.run(host='127.0.0.1', port=5000)
