# Copyright (c) 2023, CE Construction and contributors
# For license information, please see license.txt

# import frappe
#from frappe.model.document import Document

#class HousingBooking(Document):pass
	
	
data = frappe.db.get_list('Installment', fields=['installment_name','installment_type', 'Operation'],order_by='creation asc')
frappe.response['Installment_List'] = data
