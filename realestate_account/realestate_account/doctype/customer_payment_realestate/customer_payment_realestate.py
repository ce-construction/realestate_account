# Copyright (c) 2023, CE Construction and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
@frappe.whitelist()
def get_payment_list():
    arg_booking_no = frappe.form_dict.name
    query = """
        SELECT d.Installment, d.amount - IFNULL((
            SELECT SUM(b.paid_amount) AS paid_amount
            FROM `tabCustomer Payment Realestate` AS a
            INNER JOIN `tabCustomer Payment Installment` AS b ON a.name = b.parent
            WHERE a.plot_no = c.plot_no AND b.installment = d.installment
            ORDER BY a.creation DESC
        ), 0) AS receivable_amount
        FROM `tabHousing Booking` AS c
        INNER JOIN `tabInstallment Payment Plan` AS d ON c.name = d.parent
        WHERE c.name = '{}'
        ORDER BY d.idx ASC
    """.format(arg_booking_no)
    
    data = frappe.db.sql(query, as_dict=True)
    return data
class CustomerPaymentRealestate(Document):
	pass
