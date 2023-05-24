# Copyright (c) 2023, CE Construction and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
@frappe.whitelist()
def get_installment_list():
    data = frappe.db.get_list('Installment', fields=['installment_name', 'installment_type', 'Operation'], order_by='creation asc')
    return data
class HousingBooking(Document):
	pass

