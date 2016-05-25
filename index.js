var Vue = require('vue')
var VueResource = require('vue-resource')
var Vuetable = require('vuetable/src/components/Vuetable.vue')
var VuetablePagination = require('vuetable/src/components/VuetablePagination.vue')
var VuetablePaginationDropdown = require('vuetable/src/components/VuetablePaginationDropdown.vue')
var VueEditable = require('./components/vue-editable.js')

Vue.use(VueResource)
Vue.use(VueEditable)

var E_SERVER_ERROR = 'Error communicating with the server'

// fields definition
var tableColumns = [
    {
        name: 'name',
        sortField: 'name',
    },
    {
        name: 'email',
        sortField: 'email',
    },
    {
        name: 'nickname',
        sortField: 'nickname',
        callback: 'allCap'
    },
    {
        name: 'birthdate',
        sortField: 'birthdate',
        callback: 'formatDate|D/MM/Y'
    },
    {
        name: 'gender',
        sortField: 'gender',
        titleClass: 'text-center',
        dataClass: 'text-center',
        callback: 'gender'
    },
    {
        name: 'created_at',
        title: 'Created',
        titleClass: 'text-center',
        dataClass: 'text-center',
        callback: 'formatDate|D/MM/Y'
    },
    {
        name: '__actions',
        title: '',
        titleClass: 'text-center',
        dataClass: 'text-center',
    }
]

// Vue.config.debug = true

Vue.component('vuetable-pagination', VuetablePagination)
Vue.component('vuetable-pagination-dropdown', VuetablePaginationDropdown)

new Vue({
    el: '#app',
    components: {
        'vuetable': Vuetable,
    },
    data: {
        searchFor: '',
        fields: tableColumns,
        sortOrder: {
            field: 'name',
            direction: 'asc'
        },
        perPage: 10,
        paginationComponent: 'vuetable-pagination',
        paginationInfoTemplate: 'แสดง {from} ถึง {to} จากทั้งหมด {total} รายการ',
        itemActions: [
            { name: 'view-item', label: '', icon: 'glyphicon glyphicon-zoom-in', class: 'btn btn-info' },
            { name: 'edit-item', label: '', icon: 'glyphicon glyphicon-pencil', class: 'btn btn-warning'},
            { name: 'delete-item', label: '', icon: 'glyphicon glyphicon-remove', class: 'btn btn-danger' }
        ],
        moreParams: [],
    },
    watch: {
        'perPage': function(val, oldVal) {
            this.$broadcast('vuetable:refresh')
        },
        'paginationComponent': function(val, oldVal) {
            this.$broadcast('vuetable:load-success', this.$refs.vuetable.tablePagination)
            this.paginationConfig(this.paginationComponent)
        }
    },
    methods: {
        /**
         * Callback functions
         */
        allCap: function(value) {
            return value.toUpperCase()
        },
        gender: function(value) {
          return value == 'M'
            ? '<span class="label label-info"><i class="glyphicon glyphicon-star"></i> Male</span>'
            : '<span class="label label-success"><i class="glyphicon glyphicon-heart"></i> Female</span>'
        },
        formatDate: function(value, fmt) {
            if (value == null) return ''
            fmt = (typeof fmt == 'undefined') ? 'D MMM YYYY' : fmt
            return moment(value, 'YYYY-MM-DD').format(fmt)
        },
        /**
         * Other functions
         */
        setFilter: function() {
            this.moreParams = [
                'filter=' + this.searchFor
            ]
            this.$nextTick(function() {
                this.$broadcast('vuetable:refresh')
            })
        },
        resetFilter: function() {
            this.searchFor = ''
            this.setFilter()
        },
        changePaginationComponent: function() {
            this.$broadcast('vuetable:load-success', this.$refs.vuetable.tablePagination)
        },
        preg_quote: function( str ) {
            // http://kevin.vanzonneveld.net
            // +   original by: booeyOH
            // +   improved by: Ates Goral (http://magnetiq.com)
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: Onno Marsman
            // *     example 1: preg_quote("$40");
            // *     returns 1: '\$40'
            // *     example 2: preg_quote("*RRRING* Hello?");
            // *     returns 2: '\*RRRING\* Hello\?'
            // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
            // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'

            return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
        },
        highlight: function(needle, haystack) {
            return haystack.replace(
                new RegExp('(' + this.preg_quote(needle) + ')', 'ig'),
                '<span class="highlight">$1</span>'
            )
        },
        paginationConfig: function(componentName) {
            console.log('paginationConfig: ', componentName)
            if (componentName == 'vuetable-pagination') {
                this.$broadcast('vuetable-pagination:set-options', {
                    wrapperClass: 'pagination',
                    icons: { first: '', prev: '', next: '', last: ''},
                    activeClass: 'active',
                    linkClass: 'btn btn-default',
                    pageClass: 'btn btn-default'
                })
            }
            if (componentName == 'vuetable-pagination-dropdown') {
                this.$broadcast('vuetable-pagination:set-options', {
                    wrapperClass: 'form-inline',
                    icons: { prev: 'glyphicon glyphicon-chevron-left', next: 'glyphicon glyphicon-chevron-right' },
                    dropdownClass: 'form-control'
                })
            }
        }
    },
    events: {
        'vuetable:action': function(action, data) {
            console.log('vuetable:action', action, data)

            if (action == 'view-item') {
                sweetAlert(action, data.name)
            } else if (action == 'edit-item') {
                sweetAlert(action, data.name)
            } else if (action == 'delete-item') {
                sweetAlert(action, data.name)
            }
        },
        'vuetable:cell-dblclicked': function(item, field, event) {
            var self = this
            console.log('cell-dblclicked: old value =', item[field.name])
            this.$editable(event, function(value) {
                console.log('$editable callback:', value)
            })
        },
        'vuetable:load-success': function(response) {
            console.log('main.js: total = ', response.data.total)
            var data = response.data.data
            if (this.searchFor !== '') {
                for (n in data) {
                    data[n].name = this.highlight(this.searchFor, data[n].name)
                    data[n].email = this.highlight(this.searchFor, data[n].email)
                }
            }
        },
        'vuetable:load-error': function(response) {
            if (response.status == 400) {
                sweetAlert('Something\'s Wrong!', response.data.message, 'error')
            } else {
                sweetAlert('Oops', E_SERVER_ERROR, 'error')
            }
        }
    }
})
