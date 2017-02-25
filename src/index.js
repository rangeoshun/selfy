'use strict';

var prompt = require('prompt');
prompt.start();

function model ()
{
  return {
    list: [],
    series: []
  };
}

const LEX = [[]];

function pattern ( _str )
{
  const str = _str + '';
  const arr = str.split('');

  return arr.reduce(toPattern, model());
}

function toPattern( _acc, _str )
{
  const acc = _acc || model();
  const str = _str + '';
  const list = ([]).concat(acc.list);
  const series = ([]).concat(acc.series);
  const index = (list || []).indexOf(str);

  if (index > -1) {
    return {
      list: list.filter(() => true),
      series: series.concat(index)
    };
  }

  return {
    list: list.concat(str),
    series: series.concat(series.length)
  };
}

function toI ( _, _i )
{
  return _i | 0;
}

function lex ( _pattern )
{
  const pattern = _pattern || model();
  const list = ([]).concat(_pattern.list);

  return list;
}

function addToLex ( _list, _str )
{
  const list = _list || [];
  const str = _str + '';
  const index = list.indexOf(str);

  if (index > -1) {
    return list;
  }

  return list.concat(str);
}

function mergeLex ( _to, _from )
{
  const to = _to || [];
  const from = _from || [];
  const merged = from.reduce(addToLex, to);

  return merged.reduce(addToLex, to);
}

function normalize ( _pattern, _lex )
{
  const pattern = _pattern || model();
  const list = pattern.list || [];
  const series = pattern.series || [];
  const lex = _lex || [];

  return series.map(( sym ) => lex.indexOf(list[sym]));
}

function input ()
{
  prompt.get(
    '>',
    handleInput
  );
}

function handleInput (err, result)
{
  const input = result['>'];
  const patterned = pattern(input);

  LEX[0] = mergeLex(LEX[0], lex(patterned));
  LEX.push(normalize(patterned, LEX[0]));

  console.log(JSON.stringify(patterned));
  console.log(JSON.stringify(LEX));

  prompt.get(
    '>',
    handleInput
  );
}

input();