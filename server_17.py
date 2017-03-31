import psycopg2
import cx_Oracle
import json
import string
from flask import Flask, request, send_from_directory
from config import con

app = Flask(__name__)

@app.route('/test/<filename>')
def test(filename):
    print(filename)
    #with con.cursor() as cursor:
    cursor = con.cursor()
    query = "SELECT json_arrayagg(json_object('type' IS 'Feature','geometry' IS geojson,'properties' IS json_object('dp_ctype' IS dp_ctype, 'dp_otype' IS dp_otype ))returning clob) as tempclob FROM {0} where dbms_lob.getlength(geojson)<3900 and rownum < 20000".format(filename)
    #query1 ="""select '{"type": "FeatureCollection", "features":' || to_char(ab.tempclob) || '}' from """ + query
    print(query)
    cursor.execute(query)
    inVar = (cursor.fetchone()[0])
    invar = '{"type": "FeatureCollection", "features":' + ((str(inVar).replace('"{','{')).replace('}"','}')).replace('\\','') + '}'

    return (json.dumps(invar))

if __name__ == "__main__":
    app.debug = True
    app.run(host='127.0.0.1', port=5000)
